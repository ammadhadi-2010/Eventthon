import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  createAdminUser,
  deleteAdminUser,
  downloadUsersExport,
  fetchUserManagementStats,
  fetchUsersList,
  updateUserStatus,
} from '../../../../services/adminUserManagementService';
import { buildStatsFromApi } from './userManagementStatsBuilder';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 350;

export default function useUserManagement() {
  const [stats, setStats] = useState(null);
  const [rows, setRows] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  const searchFirst = useRef(true);
  const searchTimer = useRef(null);

  useEffect(() => {
    if (searchFirst.current) {
      searchFirst.current = false;
      setDebouncedSearch(searchQuery.trim());
      return;
    }
    if (searchTimer.current) window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (searchTimer.current) window.clearTimeout(searchTimer.current);
    };
  }, [searchQuery]);

  const loadStats = useCallback(async () => {
    try {
      const data = await fetchUserManagementStats();
      setStats(buildStatsFromApi(data));
      setError(null);
    } catch (e) {
      console.error(e);
      setStats(buildStatsFromApi(null));
      setError(e?.response?.data?.detail || e?.message || 'Failed to load stats');
    }
  }, []);

  const loadUsers = useCallback(async () => {
    setListLoading(true);
    try {
      const data = await fetchUsersList({
        tab: activeTab,
        q: debouncedSearch,
        page,
        pageSize: PAGE_SIZE,
      });
      setRows(Array.isArray(data.rows) ? data.rows : []);
      setTotalItems(typeof data.total === 'number' ? data.total : 0);
      setTotalPages(Math.max(1, data.total_pages || 1));
      setError(null);
    } catch (e) {
      console.error(e);
      setRows([]);
      setTotalItems(0);
      setTotalPages(1);
      setError(e?.response?.data?.detail || e?.message || 'Failed to load users');
    } finally {
      setListLoading(false);
      setLoading(false);
    }
  }, [activeTab, debouncedSearch, page]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const statCards = useMemo(() => stats || buildStatsFromApi(null), [stats]);

  const exportCsv = useCallback(() => {
    downloadUsersExport({ tab: activeTab, q: debouncedSearch });
  }, [activeTab, debouncedSearch]);

  const addUser = useCallback(
    async (payload) => {
      const res = await createAdminUser(payload);
      await loadStats();
      if (res?.user && page === 1 && activeTab === 'all' && !debouncedSearch) {
        setRows((prev) => [res.user, ...prev.slice(0, PAGE_SIZE - 1)]);
        setTotalItems((t) => t + 1);
      } else {
        await loadUsers();
      }
    },
    [loadStats, loadUsers, page, activeTab, debouncedSearch]
  );

  const userAction = useCallback(
    async (actionKey, action) => {
      if (!actionKey) return;
      if (action === 'delete_user') {
        await deleteAdminUser(actionKey, true);
      } else {
        await updateUserStatus(actionKey, action);
      }
      await loadStats();
      await loadUsers();
    },
    [loadStats, loadUsers],
  );

  const onTabChange = useCallback((id) => {
    setActiveTab(id);
    setPage(1);
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([loadStats(), loadUsers()]);
  }, [loadStats, loadUsers]);

  return {
    statCards,
    rows,
    totalItems,
    totalPages,
    pageSize: PAGE_SIZE,
    loading,
    listLoading,
    error,
    activeTab,
    setActiveTab: onTabChange,
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    exportCsv,
    addUser,
    userAction,
    refresh: loadUsers,
    refreshAll,
  };
}
