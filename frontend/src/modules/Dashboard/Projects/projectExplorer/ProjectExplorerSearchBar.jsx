import React from 'react';
import { FiArrowLeft, FiSearch } from 'react-icons/fi';

export default function ProjectExplorerSearchBar({
  listSearchDraft,
  setListSearchDraft,
  runExplorerSearch,
  onNavigateBack,
}) {
  return (
    <div className="gigx-head">
      <button type="button" className="gigx-back" onClick={onNavigateBack}>
        <FiArrowLeft size={14} /> Back to Projects
      </button>
      <div className="gigx-search-live">
        <FiSearch size={18} className="gigx-search-live-icon" aria-hidden />
        <input
          type="search"
          className="gigx-search-live-input"
          placeholder="Search featured projects..."
          value={listSearchDraft}
          onChange={(event) => setListSearchDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') runExplorerSearch();
          }}
        />
        <button type="button" className="gigx-search-live-btn" onClick={runExplorerSearch}>
          Search
        </button>
      </div>
    </div>
  );
}
