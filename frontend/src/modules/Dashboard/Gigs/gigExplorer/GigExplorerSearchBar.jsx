import React from 'react';
import { FiSearch } from 'react-icons/fi';

const GigExplorerSearchBar = ({ listSearchDraft, setListSearchDraft, runExplorerSearch }) => (
  <div className="gigx-head gigx-head--desktop-search">
    <div className="gigx-search-live">
      <FiSearch size={18} className="gigx-search-live-icon" aria-hidden />
      <input
        type="search"
        className="gigx-search-live-input"
        placeholder="Search gigs, skills, or keywords..."
        value={listSearchDraft}
        onChange={(event) => setListSearchDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') runExplorerSearch();
        }}
      />
      <button type="button" className="gigx-search-live-btn" onClick={() => runExplorerSearch()}>
        Search
      </button>
    </div>
  </div>
);

export default GigExplorerSearchBar;
