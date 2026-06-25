import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { JOB_FILTERS } from './jobBoardUtils';

export default function JobBoardSearchHeader({ query, onQueryChange, onSearch, filters }) {
  const [activeFilter, setActiveFilter] = useState('Remote');
  const pills = filters?.length ? filters : JOB_FILTERS;

  return (
    <header className="ps-jb-header">
      <h1>Find remote jobs from global companies</h1>
      <p className="ps-jb-header__sub">Search verified roles, filter by work style, and apply in one click.</p>
      <form
        className="ps-jb-search ps-jb-search--inline"
        onSubmit={(e) => {
          e.preventDefault();
          onSearch?.();
        }}
      >
        <div className="ps-jb-search__box">
          <Search size={18} className="ps-jb-search__icon" aria-hidden />
          <input
            type="search"
            className="ps-jb-search__input"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search by role, company, or skill…"
            aria-label="Search jobs"
          />
          <button type="submit" className="ps-jb-search__submit">
            Search
          </button>
        </div>
      </form>
      <div className="ps-jb-filters" role="group" aria-label="Quick filters">
        {pills.map((label) => (
          <button
            key={label}
            type="button"
            className={`ps-jb-filter${activeFilter === label ? ' is-active' : ''}`}
            onClick={() => setActiveFilter(label)}
          >
            {label}
          </button>
        ))}
      </div>
    </header>
  );
}
