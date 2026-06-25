import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiFilter, FiPlus, FiSearch } from 'react-icons/fi';
import SquadProjectCard from '../projects/SquadProjectCard';
import ProjectDetailView from '../projects/ProjectDetailView';
import { normalizeStatus } from '../projects/squadProjectCardModel';
import '../../styles/squad-project-card.css';

const ProjectsTab = ({
  projects = [],
  squad,
  userData,
  onUpdateProject,
  onDeleteProject,
  onSyncProject,
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [viewProject, setViewProject] = useState(null);

  const total = projects.length;
  const inProgress = projects.filter((p) => normalizeStatus(p.status) === 'in progress').length;
  const completed = projects.filter((p) => normalizeStatus(p.status) === 'completed').length;
  const hold = projects.filter((p) => normalizeStatus(p.status) === 'on hold').length;

  const filteredProjects = useMemo(() => {
    if (!query.trim()) return projects;
    const term = query.toLowerCase();
    return projects.filter((project) => {
      const hay = [
        project.title,
        project.description,
        project.owner,
        ...(project.tags || []),
        ...(project.tech_stack || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(term);
    });
  }, [projects, query]);

  const openCreateWizard = () => {
    const squadQuery = squad?._id ? `?squad=${encodeURIComponent(squad._id)}` : '';
    navigate(`/projects/new${squadQuery}`);
  };

  const openEditWizard = (project) => {
    if (!squad?._id || !project?.id) return;
    setActiveMenuId(null);
    setViewProject(null);
    const params = new URLSearchParams({
      squad: squad._id,
      squadProjectId: project.id,
      mode: 'edit',
    });
    navigate(`/projects/new?${params.toString()}`);
  };

  if (viewProject) {
    const live =
      projects.find((p) => p.id === viewProject.id) || viewProject;
    return (
      <ProjectDetailView
        project={live}
        squadId={squad?._id}
        userData={userData}
        onBack={() => setViewProject(null)}
        onEdit={openEditWizard}
        onProjectUpdated={(updated) => {
          setViewProject(updated);
          onSyncProject?.(updated);
        }}
      />
    );
  }

  return (
    <div className="sq-projects-tab" style={wrap}>
      <div className="sq-projects-kpi-grid" style={kpiGrid}>
        <KpiCard label="Total Projects" value={total} delta="+20% this month" positive tint="#8b5cf6" />
        <KpiCard label="In Progress" value={inProgress} delta={`+${Math.max(1, inProgress)} this week`} positive tint="#38bdf8" />
        <KpiCard label="Completed" value={completed} delta="+3 this week" positive tint="#34d399" />
        <KpiCard label="On Hold" value={hold} delta="-1 this week" tint="#f87171" />
      </div>

      <div className="sq-projects-toolbar" style={toolbar}>
        <div className="sq-projects-search" style={searchWrap}>
          <FiSearch size={13} color="#64748b" />
          <input
            style={searchInput}
            placeholder="Search projects..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <button type="button" className="sq-projects-ghost-btn" style={ghostBtn}>
          <FiFilter /> Filters
        </button>
        <button type="button" className="sq-projects-primary-btn" style={primaryBtn} onClick={openCreateWizard}>
          <FiPlus /> New Project
        </button>
      </div>

      <div style={listShell}>
        {filteredProjects.length === 0 ? (
          <div className="sq-projects-empty" style={emptyState}>No projects matched your search.</div>
        ) : (
          <div className="sq-proj-list">
            {filteredProjects.map((project, index) => (
              <SquadProjectCard
                key={project.id || `${project.title}-${index}`}
                project={project}
                index={index}
                isMenuOpen={activeMenuId === (project.id || `${project.title}-${index}`)}
                onMenuToggle={(id) => setActiveMenuId((prev) => (prev === id ? null : id))}
                onView={setViewProject}
                onEdit={openEditWizard}
                onDelete={async (projectId) => {
                  setActiveMenuId(null);
                  if (!projectId || !onDeleteProject) return;
                  if (!window.confirm('Delete this project?')) return;
                  await onDeleteProject(projectId);
                }}
                onMarkCompleted={(p) => {
                  setActiveMenuId(null);
                  onUpdateProject?.(p.id, { status: 'Completed', progress: 100 });
                }}
                onMarkHold={(p) => {
                  setActiveMenuId(null);
                  onUpdateProject?.(p.id, { status: 'On Hold', progress: 40 });
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const KpiCard = ({ label, value, delta, positive, tint }) => (
  <div style={{ ...kpiCard, border: `1px solid ${tint}44`, boxShadow: `inset 0 0 32px ${tint}1a` }}>
    <small className="sq-projects-kpi-label" style={kpiLabel}>{label}</small>
    <strong className="sq-projects-kpi-value" style={kpiValue}>{value}</strong>
    <small className={`sq-projects-kpi-delta${positive ? ' is-positive' : ' is-negative'}`} style={kpiDelta}>{delta}</small>
  </div>
);

const wrap = { display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' };
const kpiGrid = { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '12px' };
const kpiCard = {
  background: 'linear-gradient(145deg, rgba(10,20,40,0.92), rgba(7,12,26,0.96))',
  borderRadius: '14px',
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};
const kpiLabel = { color: '#8ea1c8', fontSize: '13px', fontWeight: '600' };
const kpiValue = { color: '#f1f5ff', fontSize: '40px', lineHeight: 1 };
const kpiDelta = { fontSize: '14px', fontWeight: '700' };
const toolbar = { display: 'flex', gap: '8px', alignItems: 'center' };
const searchWrap = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  background: '#071224',
  border: '1px solid rgba(89,117,179,0.35)',
  borderRadius: '12px',
  padding: '11px 12px',
};
const searchInput = {
  flex: 1,
  background: 'transparent',
  border: 'none',
  outline: 'none',
  color: '#e2e8f0',
  fontSize: '13px',
};
const ghostBtn = {
  background: 'linear-gradient(145deg, rgba(30,41,59,0.85), rgba(15,23,42,0.9))',
  border: '1px solid rgba(148,163,184,0.25)',
  color: '#cbd5e1',
  borderRadius: '12px',
  padding: '10px 16px',
  cursor: 'pointer',
  fontSize: '13px',
  display: 'flex',
  gap: '6px',
  alignItems: 'center',
};
const primaryBtn = {
  background: 'linear-gradient(135deg,#2563eb,#3b82f6)',
  border: '1px solid rgba(96,165,250,0.6)',
  color: '#fff',
  borderRadius: '12px',
  padding: '10px 16px',
  cursor: 'pointer',
  fontSize: '13px',
  display: 'flex',
  gap: '6px',
  alignItems: 'center',
  fontWeight: '700',
};
const listShell = {
  background: 'linear-gradient(180deg, rgba(6,18,37,0.5), rgba(3,11,24,0.5))',
  border: '1px solid rgba(59,130,246,0.15)',
  borderRadius: '14px',
  overflow: 'visible',
};
const emptyState = { color: '#8fa3c7', textAlign: 'center', padding: '24px', fontSize: '13px' };

export default ProjectsTab;
