import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, useParams, useLocation } from 'react-router-dom';
import ConnectionsNavSidebar from './ConnectionsNavSidebar';
import UserListCard from './UserListCard';
import ViewAllListFooter from './ViewAllListFooter';
import HubMobileTopBar from '../../components/mobile/HubMobileTopBar';
import { HUB_MOBILE_SEARCH } from '../../components/mobile/hubMobileSearchPresets';
import ViewAllPageChrome from './ViewAllPageChrome';
import { fetchConnectionsList } from './fetchConnectionsList';
import { getListPageMeta, isValidListKey } from './connectionsListConfig';
import { postProfileSocialAction } from '../services/profileOverviewService';
import './connections-page.css';
import './connections-page-mobile-chrome.css';
import './connections-page-mobile-drawer.css';

export default function ConnectionsPage({ userData }) {
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastViewAllScroll, setLastViewAllScroll] = useState(0);
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const { listKey: listKeyParam } = useParams();
  const { pathname } = useLocation();
  const listKey = String(listKeyParam || '').toLowerCase();
  const identifier = (userData?.email || userData?.mobile || '').trim();

  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 8;

  const meta = useMemo(
    () => getListPageMeta(isValidListKey(listKey) ? listKey : 'commanders', stats),
    [listKey, stats],
  );

  const closeLeftDrawer = useCallback(() => setLeftDrawerOpen(false), []);
  const openLeftDrawer = useCallback(() => setLeftDrawerOpen(true), []);

  const resetPageScroll = useCallback(() => {
    const scrollRoot = document.querySelector('main.et-main-scroll') || window;
    if (scrollRoot === window) {
      window.scrollTo(0, 0);
    } else {
      scrollRoot.scrollTop = 0;
    }
    setIsHeaderVisible(true);
    setLastViewAllScroll(0);
  }, []);

  useEffect(() => {
    resetPageScroll();
    const frame = requestAnimationFrame(resetPageScroll);
    return () => cancelAnimationFrame(frame);
  }, [pathname, listKey, resetPageScroll]);

  useEffect(() => {
    const scrollRoot = document.querySelector('main.et-main-scroll') || window;
    const getScrollY = () => (scrollRoot === window ? window.scrollY : scrollRoot.scrollTop);

    const handleScrollTracking = () => {
      const currentScroll = getScrollY();
      if (currentScroll > lastViewAllScroll && currentScroll > 50) {
        setIsHeaderVisible(false);
      } else {
        setIsHeaderVisible(true);
      }
      setLastViewAllScroll(currentScroll);
    };

    scrollRoot.addEventListener('scroll', handleScrollTracking, { passive: true });
    return () => scrollRoot.removeEventListener('scroll', handleScrollTracking);
  }, [lastViewAllScroll]);

  useEffect(() => {
    if (!leftDrawerOpen) return undefined;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [leftDrawerOpen]);

  const reloadList = useCallback(() => {
    if (!identifier || !isValidListKey(listKey)) return Promise.resolve();
    return fetchConnectionsList({ identifier, listKey }).then((res) => {
      setItems(res.items);
      setStats(res.stats || {});
    });
  }, [identifier, listKey]);

  const handleSocialAction = useCallback(
    async (targetId, action = 'connect') => {
      if (!identifier || !targetId) return;
      if (action === 'message') {
        window.alert('Open Messages from the top nav to start a chat.');
        return;
      }
      try {
        await postProfileSocialAction(identifier, { action, target_user_id: targetId });
        await reloadList();
      } catch (e) {
        window.alert(e?.response?.data?.detail || e?.message || 'Action failed');
      }
    },
    [identifier, reloadList],
  );

  useEffect(() => {
    if (!identifier) return;
    if (!isValidListKey(listKey)) {
      setItems([]);
      setStats({});
      setLoading(false);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchConnectionsList({ identifier, listKey })
      .then((res) => {
        if (cancelled) return;
        setItems(res.items);
        setStats(res.stats || {});
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e?.message || 'Failed to load list');
        setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [identifier, listKey]);

  useEffect(() => {
    setPage(1);
  }, [listKey, query, onlineOnly]);

  const filtered = useMemo(() => {
    let rows = items;
    const q = query.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (r) =>
          String(r.name || '')
            .toLowerCase()
            .includes(q) ||
          String(r.headline || '')
            .toLowerCase()
            .includes(q) ||
          String(r.squadLine || '')
            .toLowerCase()
            .includes(q),
      );
    }
    if (onlineOnly) rows = rows.filter((r) => r.online);
    return rows;
  }, [items, query, onlineOnly]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE) || 1);
  const safePage = Math.min(page, totalPages);
  const pageItems = useMemo(() => {
    const p = Math.min(page, totalPages);
    const start = (p - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page, totalPages, PAGE_SIZE]);

  const maxPagerBtns = 5;
  const pageNumbers =
    totalPages <= maxPagerBtns
      ? Array.from({ length: totalPages }, (_, i) => i + 1)
      : (() => {
          const half = Math.floor(maxPagerBtns / 2);
          let start = Math.max(1, safePage - half);
          let end = Math.min(totalPages, start + maxPagerBtns - 1);
          start = Math.max(1, end - maxPagerBtns + 1);
          return Array.from({ length: end - start + 1 }, (_, i) => start + i);
        })();

  const viewerDisplayName =
    [userData?.firstName, userData?.lastName].filter(Boolean).join(' ').trim() ||
    String(userData?.name || userData?.displayName || '').trim() ||
    'you';

  if (!identifier) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!isValidListKey(listKey)) {
    return <Navigate to="/profile/connections/commanders" replace />;
  }

  const pageTitle = meta.title(stats);
  const hasActiveFilter = Boolean(query.trim()) || onlineOnly;
  const statsTotal = Number(meta.totalFromStats(stats));
  const totalAll = hasActiveFilter ? filtered.length : statsTotal || filtered.length;
  const footerNoun = listKey === 'mutual' ? 'connections' : 'results';
  const from = filtered.length ? (safePage - 1) * PAGE_SIZE + 1 : 0;
  const to = filtered.length ? (safePage - 1) * PAGE_SIZE + pageItems.length : 0;

  const subtitle =
    typeof meta.resolveSubtitle === 'function'
      ? meta.resolveSubtitle(viewerDisplayName)
      : meta.subtitle;

  return (
    <div className={`pnet-root pnet-mobile-shell${leftDrawerOpen ? ' pnet-root--nav-open' : ''}`}>
      <HubMobileTopBar
        isVisible={isHeaderVisible}
        searchQuery={query}
        onSearchQueryChange={setQuery}
        searchPlaceholder={meta.searchPlaceholder || HUB_MOBILE_SEARCH.connections.searchPlaceholder}
        searchAriaLabel={meta.searchPlaceholder || HUB_MOBILE_SEARCH.connections.searchAriaLabel}
        headerAriaLabel={HUB_MOBILE_SEARCH.connections.headerAriaLabel}
        onAvatarClick={openLeftDrawer}
        avatarAriaLabel="Open profile navigation"
      />

      {leftDrawerOpen ? (
        <button
          type="button"
          className="pnet-nav-drawer-backdrop"
          aria-label="Close profile navigation"
          onClick={closeLeftDrawer}
        />
      ) : null}

      <div className={`pnet-nav-rail${leftDrawerOpen ? ' is-drawer-open' : ''}`}>
        <ConnectionsNavSidebar userData={userData} stats={stats} onNavigate={closeLeftDrawer} />
      </div>

      <main className="pnet-main">
        <ViewAllPageChrome
          isHeaderVisible={isHeaderVisible}
          pageTitle={pageTitle}
          subtitle={subtitle}
          searchPlaceholder={meta.searchPlaceholder}
          query={query}
          onQueryChange={setQuery}
          onlineOnly={onlineOnly}
          onToggleOnline={() => setOnlineOnly((v) => !v)}
        />

        {loading ? (
          <div className="pnet-loading" role="status" aria-live="polite">
            <span className="pnet-loading__dot" />
            <span className="pnet-loading__dot" />
            <span className="pnet-loading__dot" />
            <span>Loading network…</span>
          </div>
        ) : null}
        {error ? (
          <p className="pnet-status pnet-status--err" role="alert">
            {error}
          </p>
        ) : null}

        <div className="pnet-list">
          {pageItems.map((user) => (
            <UserListCard
              key={user.id}
              user={user}
              listMode={meta.listMode}
              socialVariant={meta.socialVariant}
              onSocialAction={handleSocialAction}
            />
          ))}
        </div>

        <ViewAllListFooter
          from={from}
          to={to}
          totalAll={totalAll}
          footerNoun={footerNoun}
          totalPages={totalPages}
          safePage={safePage}
          pageNumbers={pageNumbers}
          onPageChange={setPage}
        />
      </main>
    </div>
  );
}
