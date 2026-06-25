import React from 'react';
import { Filter, Search } from 'lucide-react';
import { GIG_FILTER_TABS } from './gigData';

export default function GigManagementToolbar({ activeTab, onTabChange, query, onQueryChange }) {
  return (
    <div className="um-toolbar gm-toolbar">
      <div className="um-toolbar-tabs um-toolbar-tabs--scroll gm-toolbar-tabs">
        {GIG_FILTER_TABS.map((tab) => (
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
      <div className="um-toolbar-actions gm-toolbar-actions">
        <div className="um-search">
          <Search size={14} className="um-search-icon" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search gigs..."
            className="um-search-input"
          />
        </div>
        <button type="button" className="um-filter-btn gm-filter-btn">
          <Filter size={14} aria-hidden />
          Filters
        </button>
      </div>
    </div>
  );
}
