import React from 'react';
import { Search } from 'lucide-react';
import JobTableRow from './JobTableRow';

export default function JobManagementTable({
  rows,
  loading,
  selectedJobId,
  query,
  onQueryChange,
  statusFilter,
  onStatusFilterChange,
  onView,
  onEdit,
  onStatusChange,
  onDelete,
}) {
  return (
    <section className="um-card jm-main-card jm-main-card--full">
      <div className="um-toolbar jm-toolbar">
        <div className="um-search jm-search-wide">
          <Search size={14} className="um-search-icon" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search jobs..."
            className="um-search-input"
          />
        </div>
        <select
          className="jm-select"
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      <div className={`w-full overflow-x-auto${loading ? ' opacity-70' : ''}`}>
        <div className={`um-table-wrap${loading ? ' um-table-wrap--loading' : ''}`}>
          <table className="um-table min-w-[950px] w-full text-left">
            <thead>
              <tr>
                <th>JOB TITLE</th>
                <th>COMPANY</th>
                <th>CATEGORY</th>
                <th>LOCATION</th>
                <th>SALARY</th>
                <th>POSTED</th>
                <th>STATUS</th>
                <th>APPLICANTS</th>
                <th className="um-th-actions">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="um-table-empty">
                    {loading ? 'Loading jobs…' : 'No jobs found in the database.'}
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <JobTableRow
                    key={row.id}
                    row={row}
                    selected={String(row.id) === String(selectedJobId)}
                    onView={onView}
                    onEdit={onEdit}
                    onStatusChange={onStatusChange}
                    onDelete={onDelete}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
