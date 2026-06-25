import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  deleteAdminJob,
  fetchAdminJobDetail,
  fetchAdminJobMetrics,
  fetchAdminJobs,
  patchAdminJobStatus,
  updateAdminJob,
} from '../../../../services/adminJobService';
import { buildJobStats } from './jobData';

export function useJobManagement() {
  const [metrics, setMetrics] = useState(null);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [m, list] = await Promise.all([
        fetchAdminJobMetrics(),
        fetchAdminJobs({ q: query, status: statusFilter, page, limit: 20 }),
      ]);
      setMetrics(m);
      setRows(list.rows);
      setTotal(list.total);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to load jobs.');
      setRows([]);
      setMetrics({ total: 0, active: 0, pending: 0, expired: 0, companies: 0 });
    } finally {
      setLoading(false);
    }
  }, [query, statusFilter, page]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => buildJobStats(metrics), [metrics]);

  const refreshMetrics = useCallback(async () => {
    const m = await fetchAdminJobMetrics();
    setMetrics(m);
  }, []);

  const setJobStatus = useCallback(
    async (jobId, status) => {
      const prev = rows;
      setRows((list) => list.map((row) => (row.id === jobId ? { ...row, status } : row)));
      try {
        const updated = await patchAdminJobStatus(jobId, status);
        if (updated) {
          setRows((list) => list.map((row) => (row.id === jobId ? updated : row)));
        }
        await refreshMetrics();
        return true;
      } catch (err) {
        setRows(prev);
        console.warn('Job status update failed:', err?.response?.data?.detail || err?.message);
        return false;
      }
    },
    [rows, refreshMetrics],
  );

  const openEditJob = useCallback(async (row) => {
    try {
      return (await fetchAdminJobDetail(row.id)) || row;
    } catch {
      return row;
    }
  }, []);

  const saveJob = useCallback(
    async (jobId, form) => {
      const updated = await updateAdminJob(jobId, form);
      if (updated) {
        setRows((list) => list.map((row) => (row.id === jobId ? updated : row)));
        await refreshMetrics();
      }
      return updated;
    },
    [refreshMetrics],
  );

  const removeJob = useCallback(
    async (jobId) => {
      if (!window.confirm('Permanently delete this job listing?')) return false;
      try {
        await deleteAdminJob(jobId);
        setRows((list) => list.filter((row) => row.id !== jobId));
        setTotal((t) => Math.max(0, t - 1));
        await refreshMetrics();
        return true;
      } catch (err) {
        console.warn('Job delete failed:', err?.response?.data?.detail || err?.message);
        return false;
      }
    },
    [refreshMetrics],
  );

  return {
    stats,
    rows,
    total,
    page,
    setPage,
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    loading,
    error,
    setJobStatus,
    openEditJob,
    saveJob,
    removeJob,
    reload: load,
  };
}
