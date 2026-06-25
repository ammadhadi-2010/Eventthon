import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAdminProjectDetail } from '../../../../services/adminProjectService';
import ProjectStatsHeader from './ProjectStatsHeader';
import ProjectOverviewPanel from './ProjectOverviewPanel';
import ProjectStatusPanel from './ProjectStatusPanel';
import RecentProjectsTable from './RecentProjectsTable';
import ProjectDetailsView from './ProjectDetailsView';
import AllProjectsView from './AllProjectsView';
import ProjectEditModal from './ProjectEditModal';
import ProjectStatusModal from './ProjectStatusModal';
import ProjectManagementHeader from './ProjectManagementHeader';
import useProjectManagement from './useProjectManagement';
import { mapProjectDetailFromApi } from './projectData';
import '../../styles/AdminShell.css';
import '../../styles/AdminCards.css';
import '../UserManagement/userManagement.css';
import './projectManagement.css';

const ADMIN_PROJECTS_PATH = '/admin-control/projects';
export default function ProjectManagementPage() {
  const navigate = useNavigate();
  const {
    recentRows,
    projects,
    stats,
    timeline,
    statusSlices,
    loading,
    error,
    editProject,
    changeStatus,
    archiveProject,
  } = useProjectManagement();

  const [rangeLabel] = useState('Last 7 months');
  const [quickOpen, setQuickOpen] = useState(false);
  const [viewingProjectId, setViewingProjectId] = useState(null);
  const [detailProject, setDetailProject] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [statusRow, setStatusRow] = useState(null);

  useEffect(() => {
    if (!viewingProjectId) {
      setDetailProject(null);
      return undefined;
    }
    const seed = projects.find((row) => String(row.id) === String(viewingProjectId));
    if (seed) setDetailProject(mapProjectDetailFromApi(seed));

    let cancelled = false;
    const load = async () => {
      setDetailLoading(true);
      try {
        const data = await fetchAdminProjectDetail(viewingProjectId);
        if (!cancelled && data) setDetailProject(mapProjectDetailFromApi(data));
      } catch (err) {
        // keep seeded row
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [viewingProjectId, projects]);

  const totalProjects = Number(
    String(stats.find((s) => s.id === 'total')?.value || '0').replace(/,/g, ''),
  );

  const runAction = async (fn, ...args) => {
    try {
      await fn(...args);
    } catch (err) {
      window.alert(err?.response?.data?.detail || err?.message || 'Action failed');
    }
  };

  if (viewingProjectId) {
    return (
      <div className="pm-page block w-full min-w-0 flex-1 overflow-y-auto text-white">
        <ProjectDetailsView
          project={detailProject}
          loading={detailLoading}
          onBack={() => setViewingProjectId(null)}
        />
      </div>
    );
  }

  if (showAllProjects) {
    return (
      <>
        <AllProjectsView
          rows={projects}
          loading={loading}
          onBack={() => setShowAllProjects(false)}
          onViewProject={setViewingProjectId}
          onEditProject={setEditRow}
          onChangeStatus={setStatusRow}
          onArchiveProject={(row) => runAction(archiveProject, row.id)}
        />
        {editRow ? (
          <ProjectEditModal
            project={editRow}
            onClose={() => setEditRow(null)}
            onSave={(payload) => runAction(editProject, editRow.id, payload)}
          />
        ) : null}
        {statusRow ? (
          <ProjectStatusModal
            project={statusRow}
            onClose={() => setStatusRow(null)}
            onSave={(status) => runAction(changeStatus, statusRow.id, status)}
          />
        ) : null}
      </>
    );
  }

  return (
    <div className="pm-page block w-full min-w-0 flex-1 overflow-y-auto text-white">
      <ProjectManagementHeader
        rangeLabel={rangeLabel}
        quickOpen={quickOpen}
        onQuickToggle={() => setQuickOpen((v) => !v)}
        onNewProject={() =>
          navigate('/projects/new?from=admin', { state: { adminReturnTo: ADMIN_PROJECTS_PATH } })
        }
      />
      {error ? (
        <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200" role="alert">
          {error}
        </div>
      ) : null}

      <ProjectStatsHeader stats={stats} />

      <div className="mb-6 grid w-full min-w-0 grid-cols-1 gap-6 md:grid-cols-3">
        <div className="min-w-0 w-full md:col-span-2">
          <ProjectOverviewPanel timeline={timeline} />
        </div>
        <div className="min-w-0 w-full md:col-span-1">
          <ProjectStatusPanel slices={statusSlices} total={totalProjects} />
        </div>
      </div>

      <RecentProjectsTable
        rows={recentRows}
        loading={loading}
        viewingProjectId={viewingProjectId}
        onViewProject={setViewingProjectId}
        onViewAll={() => setShowAllProjects(true)}
        onEditProject={setEditRow}
        onChangeStatus={setStatusRow}
        onArchiveProject={(row) => runAction(archiveProject, row.id)}
      />

      {editRow ? (
        <ProjectEditModal
          project={editRow}
          onClose={() => setEditRow(null)}
          onSave={(payload) => runAction(editProject, editRow.id, payload)}
        />
      ) : null}

      {statusRow ? (
        <ProjectStatusModal
          project={statusRow}
          onClose={() => setStatusRow(null)}
          onSave={(status) => runAction(changeStatus, statusRow.id, status)}
        />
      ) : null}
    </div>
  );
}
