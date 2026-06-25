import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  deleteAdminCompanySingular,
  fetchAdminCompanies,
  fetchCompanyDetail,
  fetchCompanyMetrics,
  fetchRecentCompanies,
  patchAdminCompanyStatus,
  updateAdminCompany,
} from '../../../../services/adminCompanyService';
import { buildCompanyStats } from './companyData';

function patchRows(list, id, patch) {
  return list.map((row) => (row.id === id ? { ...row, ...patch } : row));
}

function removeRow(list, id) {
  return list.filter((row) => row.id !== id);
}

export function useCompanyManagement() {
  const [metrics, setMetrics] = useState(null);
  const [rows, setRows] = useState([]);
  const [recent, setRecent] = useState([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [sizeFilter, setSizeFilter] = useState('all');
  const [recentOnly, setRecentOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refreshMetrics = useCallback(async () => {
    const m = await fetchCompanyMetrics();
    setMetrics(m);
    return m;
  }, []);

  const applyLocalCompany = useCallback((id, patch) => {
    setRows((prev) => patchRows(prev, id, patch));
    setRecent((prev) => patchRows(prev, id, patch));
  }, []);

  const removeLocalCompany = useCallback((id) => {
    setRows((prev) => removeRow(prev, id));
    setRecent((prev) => removeRow(prev, id));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [m, list, rec] = await Promise.all([
        fetchCompanyMetrics(),
        fetchAdminCompanies({
          q: query,
          status: statusFilter,
          industry: industryFilter,
          size: sizeFilter,
        }),
        fetchRecentCompanies(5),
      ]);
      setMetrics(m);
      setRows(list.rows);
      setRecent(rec);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to load companies.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [query, statusFilter, industryFilter, sizeFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => buildCompanyStats(metrics), [metrics]);
  const tableRows = useMemo(() => (recentOnly ? recent : rows), [recentOnly, recent, rows]);

  const toggleRecentOnly = useCallback(() => {
    setRecentOnly((value) => !value);
  }, []);

  const saveCompany = useCallback(
    async (id, payload) => {
      const updated = await updateAdminCompany(id, payload);
      if (updated) {
        applyLocalCompany(id, updated);
        await refreshMetrics();
        await load();
      }
      return updated;
    },
    [applyLocalCompany, load, refreshMetrics],
  );

  const removeCompany = useCallback(
    async (id) => {
      try {
        await deleteAdminCompanySingular(id);
        removeLocalCompany(id);
        await refreshMetrics();
        return true;
      } catch (err) {
        console.warn('Delete company failed:', err?.response?.data?.detail || err?.message);
        return false;
      }
    },
    [refreshMetrics, removeLocalCompany],
  );

  const fetchDetail = useCallback(async (id) => {
    try {
      return await fetchCompanyDetail(id);
    } catch {
      return null;
    }
  }, []);

  const runCompanyAction = useCallback(
    async (row, action) => {
      const id = row?.id;
      if (!id) return null;
      if (action === 'view') return null;
      if (action === 'delete') {
        const ok = await removeCompany(id);
        return ok ? { action: 'delete', id } : null;
      }
      if (action === 'approve' || action === 'reject') {
        const updated = await patchAdminCompanyStatus(id, action);
        if (updated) {
          applyLocalCompany(id, updated);
          await refreshMetrics();
        }
        return updated;
      }
      return null;
    },
    [applyLocalCompany, refreshMetrics, removeCompany],
  );

  return {
    stats,
    rows,
    tableRows,
    recent,
    recentOnly,
    toggleRecentOnly,
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    industryFilter,
    setIndustryFilter,
    sizeFilter,
    setSizeFilter,
    loading,
    error,
    saveCompany,
    removeCompany,
    fetchDetail,
    runCompanyAction,
    reload: load,
  };
}
