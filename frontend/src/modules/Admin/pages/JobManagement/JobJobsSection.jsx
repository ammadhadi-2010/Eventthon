import React from 'react';
import JobManagementStats from './JobManagementStats';
import JobManagementTable from './JobManagementTable';

export default function JobJobsSection({
  hub,
  selectedJobId,
  onViewJob,
  onEditJob,
  onStatusChange,
  onDeleteJob,
}) {
  const pageCount = Math.max(1, Math.ceil(hub.total / 20));

  return (
    <>
      <JobManagementStats stats={hub.stats} />
      <JobManagementTable
        rows={hub.rows}
        loading={hub.loading}
        selectedJobId={selectedJobId}
        query={hub.query}
        onQueryChange={(v) => {
          hub.setQuery(v);
          hub.setPage(1);
        }}
        statusFilter={hub.statusFilter}
        onStatusFilterChange={(v) => {
          hub.setStatusFilter(v);
          hub.setPage(1);
        }}
        onView={onViewJob}
        onEdit={onEditJob}
        onStatusChange={onStatusChange}
        onDelete={onDeleteJob}
      />
      <div className="jm-pagination">
        <span>
          Showing {hub.rows.length ? (hub.page - 1) * 20 + 1 : 0} to{' '}
          {(hub.page - 1) * 20 + hub.rows.length} of {hub.total} jobs
        </span>
        <div className="um-header-actions">
          <button
            type="button"
            className="um-btn um-btn--ghost"
            disabled={hub.page <= 1}
            onClick={() => hub.setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <button
            type="button"
            className="um-btn um-btn--ghost"
            disabled={hub.page >= pageCount}
            onClick={() => hub.setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}
