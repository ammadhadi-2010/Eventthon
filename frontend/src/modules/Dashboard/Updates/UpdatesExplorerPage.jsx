import React, { useEffect, useState } from 'react';
import UpdatesExplorerSidebar from './UpdatesExplorerSidebar';
import UpdatesExplorerHeader from './UpdatesExplorerHeader';
import UpdateGridCard from './UpdateGridCard';
import UpdatesPagination from './UpdatesPagination';
import useUpdatesExplorer from './useUpdatesExplorer';
import HubMobileTopBar from '../components/mobile/HubMobileTopBar';
import { HUB_MOBILE_SEARCH } from '../components/mobile/hubMobileSearchPresets';
import '../components/mobile/dashboard-home-mobile.css';
import './updates-explorer.css';
import './updates-explorer-mobile.css';
import './updates-explorer-mobile-chrome.css';

export default function UpdatesExplorerPage({ userData }) {
  const explorer = useUpdatesExplorer();
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const mobile = window.matchMedia('(max-width: 1023px)');
    if (!mobile.matches) return undefined;

    const scrollRoot = document.querySelector('main.et-main-scroll') || window;
    const getScrollY = () => (scrollRoot === window ? window.scrollY : scrollRoot.scrollTop);

    const handleScroll = () => {
      const currentScroll = getScrollY();
      if (currentScroll > lastScrollY && currentScroll > 50) {
        setIsHeaderVisible(false);
      } else {
        setIsHeaderVisible(true);
      }
      setLastScrollY(currentScroll);
    };

    scrollRoot.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollRoot.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <div className="upd-explorer upd-explorer-mobile-shell">
      <HubMobileTopBar
        isVisible={isHeaderVisible}
        avatarAction="leftDrawer"
        avatarAriaLabel="Open menu"
        searchQuery={explorer.searchQuery}
        onSearchQueryChange={explorer.setSearchQuery}
        {...HUB_MOBILE_SEARCH.updates}
      />
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
