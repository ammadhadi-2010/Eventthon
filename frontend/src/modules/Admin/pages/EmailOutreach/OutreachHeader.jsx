import React from 'react';
import { Eye, MoreVertical, Pencil, Plus, SlidersHorizontal } from 'lucide-react';

export default function OutreachHeader({ query, onQueryChange, onFiltersClick, onAddLead }) {
  return (
    <header className="eo-header">
      <div className="eo-header__top">
        <div>
          <h2 className="eo-title eo-title--section">Leads / Companies</h2>
          <p className="eo-subtitle">Track outreach status, replies, and warm leads across your pipeline.</p>
        </div>
        <div className="eo-header__actions">
          <button type="button" className="eo-btn eo-btn--ghost" onClick={onFiltersClick}>
            <SlidersHorizontal size={15} aria-hidden />
            Filters
          </button>
          <button type="button" className="eo-btn eo-btn--primary" onClick={onAddLead}>
            <Plus size={15} aria-hidden />
            Add Lead
          </button>
        </div>
      </div>
      <label className="eo-search">
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search companies, websites..."
          aria-label="Search companies and websites"
          className="eo-search__input"
        />
      </label>
    </header>
  );
}
