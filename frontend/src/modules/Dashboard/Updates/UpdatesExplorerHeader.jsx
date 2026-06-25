import React from 'react';
import { FiArrowLeft, FiGrid, FiList } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { EXPLORER_PILLS, EXPLORER_SORT_OPTIONS } from './updatesExplorerConfig';

export default function UpdatesExplorerHeader({
  pillFilter,
  onPillChange,
  sortKey,
  onSortChange,
  viewMode,
  onViewModeChange,
  mobileBackTo = '/dashboard',
}) {
  const navigate = useNavigate();

  return (
    <header className="upd-explorer__header">
      <div className="upd-explorer__header-top">
        <div className="upd-explorer__header-title-wrap">
          <button
            type="button"
            className="upd-explorer__header-back"
            onClick={() => navigate(mobileBackTo)}
            aria-label="Back to home"
          >
            <FiArrowLeft size={18} aria-hidden />
          </button>
          <div>
            <h1>All Updates</h1>
            <p>Stay updated with the latest activities from your network.</p>
          </div>
        </div>
        <div className="upd-explorer__header-actions">
          <select value={sortKey} onChange={(e) => onSortChange(e.target.value)}>
            {EXPLORER_SORT_OPTIONS.map((item) => (
              <option key={item.key} value={item.key}>{item.label}</option>
            ))}
          </select>
          <button
            type="button"
            className={viewMode === 'grid' ? 'is-active' : ''}
            onClick={() => onViewModeChange('grid')}
            aria-label="Grid view"
          >
            <FiGrid />
          </button>
          <button
            type="button"
            className={viewMode === 'list' ? 'is-active' : ''}
            onClick={() => onViewModeChange('list')}
            aria-label="List view"
          >
            <FiList />
          </button>
        </div>
      </div>
      <div className="upd-explorer__pills">
        {EXPLORER_PILLS.map((pill) => (
          <button
            key={pill.key}
            type="button"
            className={`upd-explorer__pill upd-explorer__pill--${pill.key}${pillFilter === pill.key ? ' is-active' : ''}`}
            onClick={() => onPillChange(pill.key)}
          >
            {pill.label}
          </button>
        ))}
      </div>
    </header>
  );
}
