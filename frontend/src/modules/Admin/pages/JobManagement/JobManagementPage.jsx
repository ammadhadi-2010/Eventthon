import React, { useState } from 'react';
import { Download, Plus } from 'lucide-react';
import JobManagementTabs from './JobManagementTabs';
import JobApplicationsTable from './JobApplicationsTable';
import JobAlertsTable from './JobAlertsTable';
import JobJobsSection from './JobJobsSection';
import JobDetailPane from './JobDetailPane';
import JobEditDrawer from './JobEditDrawer';
import { useJobManagement } from './useJobManagement';
import { useJobApplications } from './useJobApplications';
import { useJobAlerts } from './useJobAlerts';
import '../UserManagement/userManagement.css';
import './jobManagement.css';

export default function JobManagementPage() {
  const [activeTab, setActiveTab] = useState('jobs');
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [editJob, setEditJob] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const hub = useJobManagement();
  const apps = useJobApplications(activeTab === 'applications');
  const alerts = useJobAlerts(activeTab === 'alerts');

  const tabError =
    activeTab === 'applications' ? apps.error : activeTab === 'alerts' ? alerts.error : hub.error;

  const handleEditOpen = async (row) => {
    const detail = await hub.openEditJob(row);
    setEditJob(detail);
  };

  const handleEditSave = async (jobId, form) => {
    setSavingEdit(true);
    try {
      const updated = await hub.saveJob(jobId, form);
      if (updated) setEditJob(null);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleStatusChange = async (row, status) => {
    const id = row?.id || row;
    await hub.setJobStatus(id, status);
  };

  const handleDelete = async (row) => {
    const id = row?.id || row;
    const ok = await hub.removeJob(id);
    if (ok && String(selectedJobId) === String(id)) setSelectedJobId(null);
  };

  if (selectedJobId && activeTab === 'jobs') {
    const seed = hub.rows.find((row) => String(row.id) === String(selectedJobId));
    return (
      <>
        <JobDetailPane
          jobId={selectedJobId}
          seedRow={seed}
          onClose={() => setSelectedJobId(null)}
          onEdit={handleEditOpen}
          onStatusChange={handleStatusChange}
        />
        <JobEditDrawer
          job={editJob}
          open={Boolean(editJob)}
          saving={savingEdit}
          onClose={() => setEditJob(null)}
          onSave={handleEditSave}
        />
      </>
    );
  }

  return (
    <div className="um-page jm-page w-full min-w-0">
      <header className="um-header">
        <div className="um-header-copy">
          <h1 className="um-title">Job Management</h1>
          <p className="um-subtitle">Manage jobs, applications, and user job alerts.</p>
        </div>
        <div className="um-header-actions">
          <button type="button" className="um-btn um-btn--ghost">
            <Download size={14} aria-hidden />
            Export Report
          </button>
          <button type="button" className="um-btn um-btn--primary">
            <Plus size={14} aria-hidden />
            Add Job
          </button>
        </div>
      </header>

      <div className="jm-tabs-row">
        <JobManagementTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {tabError ? <p className="jm-widget-empty jm-error-banner">{tabError}</p> : null}

      {activeTab === 'jobs' ? (
        <JobJobsSection
          hub={hub}
          selectedJobId={selectedJobId}
          onViewJob={(row) => setSelectedJobId(String(row.id))}
          onEditJob={handleEditOpen}
          onStatusChange={handleStatusChange}
          onDeleteJob={handleDelete}
        />
      ) : null}

      {activeTab === 'applications' ? (
        <JobApplicationsTable
          rows={apps.rows}
          loading={apps.loading}
          busyId={apps.busyId}
          onStatusChange={apps.setStatus}
        />
      ) : null}

      {activeTab === 'alerts' ? <JobAlertsTable rows={alerts.rows} loading={alerts.loading} /> : null}

      <JobEditDrawer
        job={editJob}
        open={Boolean(editJob)}
        saving={savingEdit}
        onClose={() => setEditJob(null)}
        onSave={handleEditSave}
      />
    </div>
  );
}
