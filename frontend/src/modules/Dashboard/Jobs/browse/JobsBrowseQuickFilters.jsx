import React from 'react';
import { saveJobsBrowseFilters } from '../utils/jobsBrowseSession';

const QUICK_FILTERS = [
  { id: 'remote', label: 'Remote', patch: { workMode: 'Remote', jobType: '' } },
  { id: 'hybrid', label: 'Hybrid', patch: { workMode: 'Hybrid', jobType: '' } },
  { id: 'fulltime', label: 'Full-time', patch: { jobType: 'Full-time', workMode: '' } },
  { id: 'contract', label: 'Contract', patch: { jobType: 'Contract', workMode: '' } },
];

function isActive(filter, searchFilters) {
  if (filter.id === 'remote') return searchFilters.workMode === 'Remote';
  if (filter.id === 'hybrid') return searchFilters.workMode === 'Hybrid';
  if (filter.id === 'fulltime') return searchFilters.jobType === 'Full-time';
  if (filter.id === 'contract') return searchFilters.jobType === 'Contract';
  return false;
}

export default function JobsBrowseQuickFilters({ searchFilters, setSearchFilters }) {
  const onToggle = (filter) => {
    const active = isActive(filter, searchFilters);
    const patch = active
      ? { workMode: '', jobType: '' }
      : filter.patch;
    const next = saveJobsBrowseFilters({ ...searchFilters, ...patch });
    setSearchFilters(next);
  };

  return (
    <div className="jobs-quick-filters" role="group" aria-label="Quick job filters">
      {QUICK_FILTERS.map((filter) => {
        const active = isActive(filter, searchFilters);
        return (
          <button
            key={filter.id}
            type="button"
            className={`jobs-quick-filter${active ? ' is-active' : ''}`}
            aria-pressed={active}
            onClick={() => onToggle(filter)}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
