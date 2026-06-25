import React from 'react';
import { FiBriefcase, FiFilter, FiSearch } from 'react-icons/fi';
import {
  ACTIVITY_PROJECT_FILTERS,
  ACTIVITY_TYPE_FILTERS,
} from '../../data/projectActivityData';
import ActivityFilterDropdown from './ActivityFilterDropdown';

export default function ActivityFeedToolbar({
  query,
  onQueryChange,
  projectFilter,
  onProjectFilterChange,
  typeFilter,
  onTypeFilterChange,
  projectOptions = ACTIVITY_PROJECT_FILTERS,
  typeOptions = ACTIVITY_TYPE_FILTERS,
}) {
  return (
    <div className="ph-act-toolbar">
      <label className="ph-search ph-act-search">
        <FiSearch className="ph-search-ico" size={15} aria-hidden />
        <input
          type="search"
          placeholder="Search activities..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          aria-label="Search activities"
        />
      </label>
      <ActivityFilterDropdown
        icon={FiBriefcase}
        value={projectFilter}
        options={projectOptions}
        onChange={onProjectFilterChange}
        ariaLabel="Filter by project"
      />
      <ActivityFilterDropdown
        icon={FiFilter}
        value={typeFilter}
        options={typeOptions}
        onChange={onTypeFilterChange}
        ariaLabel="Filter by type"
      />
    </div>
  );
}
