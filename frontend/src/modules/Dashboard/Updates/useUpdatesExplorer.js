import { useEffect, useMemo, useState } from 'react';
import { fetchDashboardUpdates } from './updatesApi';
import { PAGE_SIZE } from './updatesExplorerConfig';
import {
  buildExplorerList,
  matchesTimeFilter,
  sortExplorerItems,
} from './mapExplorerUpdate';

function resolveTypeFilter(menuKey, pillKey, typeKey) {
  if (pillKey !== 'all') return pillKey;
  if (typeKey !== 'all') return typeKey;
  if (menuKey !== 'all') return menuKey;
  return 'all';
}

export default function useUpdatesExplorer() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuFilter, setMenuFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [pillFilter, setPillFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [sortKey, setSortKey] = useState('recent');
  const [viewMode, setViewMode] = useState('grid');
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const rows = await fetchDashboardUpdates();
      if (!cancelled) {
        setItems(buildExplorerList(rows));
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const activeType = resolveTypeFilter(menuFilter, pillFilter, typeFilter);

  const filteredItems = useMemo(() => {
    let rows = items.filter((item) => matchesTimeFilter(item, timeFilter));
    if (activeType !== 'all') rows = rows.filter((item) => item.type === activeType);
    const needle = searchQuery.trim().toLowerCase();
    if (needle) {
      rows = rows.filter((item) => {
        const haystack = `${item.title} ${item.message} ${item.authorName} ${item.authorTitle}`.toLowerCase();
        return haystack.includes(needle);
      });
    }
    return sortExplorerItems(rows, sortKey);
  }, [items, activeType, timeFilter, sortKey, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));

  const pagedItems = useMemo(() => {
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, page, totalPages]);

  const setMenuFilterSafe = (key) => {
    setMenuFilter(key);
    setPillFilter(key === 'all' ? 'all' : key);
    setTypeFilter(key === 'all' ? 'all' : key);
    setPage(1);
  };

  const setPillFilterSafe = (key) => {
    setPillFilter(key);
    setMenuFilter(key);
    setTypeFilter(key);
    setPage(1);
  };

  const setTypeFilterSafe = (key) => {
    setTypeFilter(key);
    setPillFilter(key);
    setMenuFilter(key);
    setPage(1);
  };

  return {
    loading,
    viewMode,
    setViewMode,
    menuFilter,
    setMenuFilter: setMenuFilterSafe,
    typeFilter,
    setTypeFilter: setTypeFilterSafe,
    pillFilter,
    setPillFilter: setPillFilterSafe,
    timeFilter,
    setTimeFilter: (key) => { setTimeFilter(key); setPage(1); },
    sortKey,
    setSortKey: (key) => { setSortKey(key); setPage(1); },
    page,
    setPage,
    totalPages,
    pagedItems,
    totalCount: filteredItems.length,
    searchQuery,
    setSearchQuery: (value) => { setSearchQuery(value); setPage(1); },
  };
}
