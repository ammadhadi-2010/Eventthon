import React from 'react';
import UpdatesExplorerSidebar from './UpdatesExplorerSidebar';
import UpdatesExplorerHeader from './UpdatesExplorerHeader';
import UpdateGridCard from './UpdateGridCard';
import UpdatesPagination from './UpdatesPagination';
import useUpdatesExplorer from './useUpdatesExplorer';
import './updates-explorer.css';
import './updates-explorer-mobile.css';
import './updates-explorer-mobile-chrome.css';

export default function UpdatesExplorerPage({ userData }) {
  const explorer = useUpdatesExplorer();

  return (
    <div className="upd-explorer upd-explorer-mobile-shell hub-inner-mobile-shell">
      <UpdatesExplorerSidebar
        userData={userData}
        menuFilter={explorer.menuFilter}
        onMenuChange={explorer.setMenuFilter}
        typeFilter={explorer.typeFilter}
        onTypeChange={explorer.setTypeFilter}
        timeFilter={explorer.timeFilter}
        onTimeChange={explorer.setTimeFilter}
      />
      <section className="upd-explorer__main">
        <UpdatesExplorerHeader
          pillFilter={explorer.pillFilter}
          onPillChange={explorer.setPillFilter}
          sortKey={explorer.sortKey}
          onSortChange={explorer.setSortKey}
          viewMode={explorer.viewMode}
          onViewModeChange={explorer.setViewMode}
        />
        {explorer.loading ? (
          <p className="upd-explorer__hint">Loading updates...</p>
        ) : (
          <div className={`upd-explorer__grid${explorer.viewMode === 'list' ? ' is-list' : ''}`}>
            {explorer.pagedItems.map((item) => (
              <UpdateGridCard key={item.id} item={item} listMode={explorer.viewMode === 'list'} />
            ))}
            {!explorer.pagedItems.length ? (
              <p className="upd-explorer__hint">No updates match your filters.</p>
            ) : null}
          </div>
        )}
        <UpdatesPagination
          page={explorer.page}
          totalPages={explorer.totalPages}
          onPageChange={explorer.setPage}
        />
      </section>
    </div>
  );
}
