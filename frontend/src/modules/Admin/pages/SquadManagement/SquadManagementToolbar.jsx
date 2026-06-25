import React from 'react';
import { Filter, Search } from 'lucide-react';
import { SQUAD_FILTER_TABS } from './squadData';

export default function SquadManagementToolbar({ activeTab, onTabChange, query, onQueryChange }) {
  return (
    <div className="um-toolbar sm-toolbar--desktop">
      <div className="um-toolbar-tabs um-toolbar-tabs--scroll sm-toolbar-tabs--desktop">
        {SQUAD_FILTER_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onTabChange(tab)}
            className={`um-tab um-tab--single-row ${activeTab === tab ? 'um-tab--active' : ''}`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="um-toolbar-actions sm-toolbar-actions--desktop">
        <div className="um-search">
          <Search size={14} className="um-search-icon" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search squads..."
            className="um-search-input"
          />
        </div>
        <button type="button" className="um-filter-btn sm-filter-btn--desktop">
          <Filter size={14} aria-hidden />
          Filters
        </button>
      </div>
    </div>
  );
}
