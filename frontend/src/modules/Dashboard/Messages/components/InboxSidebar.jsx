import React from 'react';
import { FiEdit2, FiRefreshCw, FiSearch } from 'react-icons/fi';
import { MESSAGE_FILTERS } from '../data/messageFilters';
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
}) => {
  const totalCount = allRows.length;
  const unreadCount = allRows.filter((row) => String(row.status || '').toLowerCase() === 'new').length;
  const mentionCount = allRows.filter((row) => String(row.body || '').includes('@')).length;

  return (
    <aside className="msgx-sidebar">
      <div className="msgx-sidebar-head">
        <h3>Messages</h3>
        <div className="msgx-sidebar-actions">
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
            placeholder="Search conversations..."
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
            />
          ))
        )}
      </div>
    </aside>
  );
};

export default InboxSidebar;
