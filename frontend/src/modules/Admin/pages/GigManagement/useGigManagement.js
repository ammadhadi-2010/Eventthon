import { useCallback, useEffect, useMemo, useState } from 'react';
import { GIG_FILTER_TABS, GIG_STATS, mapGigFromApi } from './gigData';
import {
  deleteAdminGig,
  fetchAdminGigs,
  fetchAdminGigStats,
  updateAdminGigStatus,
} from '../../../../services/adminGigService';

export default function useGigManagement() {
  const [sourceRows, setSourceRows] = useState([]);
  const [apiMetrics, setApiMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(GIG_FILTER_TABS[0]);
  const [query, setQuery] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [rows, metrics] = await Promise.all([
        fetchAdminGigs(),
        fetchAdminGigStats().catch(() => null),
      ]);
      setSourceRows(rows.map(mapGigFromApi));
      setApiMetrics(metrics);
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to load gigs');
      setSourceRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const stats = useMemo(() => {
    if (apiMetrics) {
      return GIG_STATS.map((item) =>
        item.id === 'totalGigs'
          ? { ...item, value: String(apiMetrics.totalGigs ?? 0) }
          : item.id === 'activeGigs'
            ? { ...item, value: String(apiMetrics.activeGigs ?? 0) }
            : item.id === 'pendingApproval'
              ? { ...item, value: String(apiMetrics.pendingApproval ?? 0) }
              : { ...item, value: String(apiMetrics.completedGigs ?? 0) },
      );
    }
    const total = sourceRows.length;
    const active = sourceRows.filter((g) => g.status === 'ACTIVE').length;
    const pending = sourceRows.filter((g) => g.status === 'PENDING').length;
    const completed = sourceRows.filter((g) => g.status === 'COMPLETED').length;
    return GIG_STATS.map((item) =>
      item.id === 'totalGigs'
        ? { ...item, value: String(total) }
        : item.id === 'activeGigs'
          ? { ...item, value: String(active) }
          : item.id === 'pendingApproval'
            ? { ...item, value: String(pending) }
            : { ...item, value: String(completed) },
    );
  }, [apiMetrics, sourceRows]);

  const rows = useMemo(() => {
    const tab = activeTab.replace('ALL ', '');
    return sourceRows.filter((g) => {
      const matchesTab = activeTab === 'ALL GIGS' || g.status === tab;
      const q = query.trim().toLowerCase();
      return (
        matchesTab &&
        (!q ||
          g.title.toLowerCase().includes(q) ||
          g.postedBy.toLowerCase().includes(q) ||
          g.postedByName.toLowerCase().includes(q))
      );
    });
  }, [activeTab, query, sourceRows]);

  const patchGig = useCallback((gigId, patch) => {
    setSourceRows((prev) =>
      prev.map((row) => (String(row.id) === String(gigId) ? { ...row, ...patch } : row)),
    );
  }, []);

  const approveGig = useCallback(
    async (gigId) => {
      const data = await updateAdminGigStatus(gigId, 'ACTIVE');
      if (data) patchGig(gigId, mapGigFromApi(data));
      else patchGig(gigId, { status: 'ACTIVE' });
      fetchAdminGigStats()
        .then((metrics) => setApiMetrics(metrics))
        .catch(() => {});
    },
    [patchGig],
  );

  const suspendGig = useCallback(
    async (gigId) => {
      const data = await updateAdminGigStatus(gigId, 'SUSPENDED');
      if (data) patchGig(gigId, mapGigFromApi(data));
      else patchGig(gigId, { status: 'CANCELLED' });
      fetchAdminGigStats()
        .then((metrics) => setApiMetrics(metrics))
        .catch(() => {});
    },
    [patchGig],
  );

  const deleteGig = useCallback(async (gigId) => {
    await deleteAdminGig(gigId);
    setSourceRows((prev) => prev.filter((row) => String(row.id) !== String(gigId)));
    fetchAdminGigStats()
      .then((metrics) => setApiMetrics(metrics))
      .catch(() => {});
  }, []);

  return {
    stats,
    rows,
    loading,
    error,
    activeTab,
    setActiveTab,
    query,
    setQuery,
    patchGig,
    approveGig,
    suspendGig,
    deleteGig,
    reload,
  };
}
