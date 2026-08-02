import React, { useState } from 'react';
import { FiEdit2, FiFilter, FiRefreshCw, FiSearch } from 'react-icons/fi';
import { MESSAGE_FILTERS } from '../data/messageFilters';
import CompanyInboxFilters from './companyOps/CompanyInboxFilters';
import './companyOps/company-ops.css';
import ConversationListItem from './ConversationListItem';

const InboxSidebar = ({
  rows,
  allRows,
  query,
  activeFilter,
  selectedId,
  onQueryChange,
  onFilterChange,
  onSelect,
  onMenuAction,
  onRefresh,
  refreshing,
  onNewMessage,
  searchInputRef,
  hideInlineSearch = false,
  companyMode = false,
  squadMode = false,
  companyFilters = null,
  onCompanyFiltersChange,
}) => {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const powerMode = companyMode || squadMode;
  const totalCount = allRows.length;
  const unreadCount = allRows.filter((row) => String(row.status || '').toLowerCase() === 'new').length;
  const mentionCount = allRows.filter((row) => String(row.body || '').includes('@')).length;
  const advancedActive = Boolean(
    companyFilters?.skills ||
      companyFilters?.date ||
      companyFilters?.stage ||
      (companyFilters?.labels || []).length,
  );

  return (
    <aside className={`msgx-sidebar${powerMode ? ' msgx-sidebar--company' : ''}`}>
      <div className="msgx-sidebar-head">
        <h3>{squadMode ? 'Squad Members' : 'Messages'}</h3>
        <div className="msgx-sidebar-actions">
          {companyMode ? (
            <button
              type="button"
              title="Advanced filters"
              className={filtersOpen || advancedActive ? 'is-on' : ''}
              onClick={() => setFiltersOpen((v) => !v)}
            >
              <FiFilter size={13} />
            </button>
          ) : null}
          <button type="button" title="Refresh" onClick={onRefresh} disabled={refreshing}>
            <FiRefreshCw size={13} />
          </button>
          <button type="button" title="New message" onClick={onNewMessage}>
            <FiEdit2 size={13} />
          </button>
        </div>
      </div>
      {!hideInlineSearch ? (
        <div className="msgx-search">
          <FiSearch size={14} />
          <input
            ref={searchInputRef}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={
              squadMode
                ? 'Search squad members…'
                : companyMode
                  ? 'Search candidates, jobs…'
                  : 'Search conversations...'
            }
          />
        </div>
      ) : null}

      <div className="msgx-filters">
        {MESSAGE_FILTERS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={activeFilter === tab.id ? 'is-active' : ''}
            onClick={() => onFilterChange(tab.id)}
          >
            {tab.label} {tab.id === 'all' ? totalCount : tab.id === 'unread' ? unreadCount : mentionCount}
          </button>
        ))}
      </div>

      {companyMode && companyFilters && filtersOpen ? (
        <CompanyInboxFilters filters={companyFilters} onChange={onCompanyFiltersChange} />
      ) : null}

      <div className="msgx-list">
        {rows.length === 0 ? (
          <p className="msgx-empty">No conversations found.</p>
        ) : (
          rows.map((row) => (
            <ConversationListItem
              key={row._id}
              item={row}
              active={selectedId === row._id}
              onSelect={onSelect}
              onMenuAction={onMenuAction}
              companyMode={companyMode || squadMode}
            />
          ))
        )}
      </div>
    </aside>
  );
};

export default InboxSidebar;
