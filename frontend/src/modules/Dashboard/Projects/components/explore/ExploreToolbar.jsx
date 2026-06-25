import React from 'react';
import { FiSearch, FiSliders } from 'react-icons/fi';

export default function ExploreToolbar({
  query,
  onQueryChange,
  onFilter,
  placeholder = 'Search projects...',
  searchLabel = 'Search projects',
}) {
  return (
    <div className="ph-exp-toolbar">
      <div className="ph-exp-search">
        <FiSearch size={16} className="ph-exp-search__ico" aria-hidden />
        <input
          type="search"
          className="ph-exp-search__input"
          placeholder={placeholder}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          aria-label={searchLabel}
        />
      </div>
      <button type="button" className="ph-mp-filter-btn ph-exp-filter" onClick={onFilter}>
        <FiSliders size={14} aria-hidden />
        Filter
      </button>
    </div>
  );
}
