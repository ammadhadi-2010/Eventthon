import React from 'react';
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from './bugReportLabels';

export default function BugReportsFilters({ filters, onChange }) {
  const setField = (key) => (event) => {
    onChange({ ...filters, [key]: event.target.value });
  };

  return (
    <section className="abr-filters admin-chip">
      <label>
        <span>Status</span>
        <select value={filters.status} onChange={setField('status')}>
          <option value="all">All Statuses</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>Priority</span>
        <select value={filters.priority} onChange={setField('priority')}>
          <option value="all">All Priorities</option>
          {PRIORITY_OPTIONS.map((priority) => (
            <option key={priority} value={priority}>
              {priority}
            </option>
          ))}
        </select>
      </label>
      <label className="abr-filters__search">
        <span>Search</span>
        <input
          type="search"
          value={filters.search}
          onChange={setField('search')}
          placeholder="Search ID, title, reporter, route..."
        />
      </label>
    </section>
  );
}
