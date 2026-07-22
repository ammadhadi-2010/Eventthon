import React from 'react';
import { FiSearch } from 'react-icons/fi';

export default function ProjectExplorerSearchBar({
  listSearchDraft,
  setListSearchDraft,
  runExplorerSearch,
}) {
  return (
    <div className="gigx-head gigx-head--search-only">
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
