import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  SQUAD_FILTER_TABS,
  SQUAD_STATS,
  mapSquadSummaryFromApi,
} from './squadData';
import {
  disbandAdminSquad,
  fetchAdminSquads,
  fetchAdminSquadStats,
  patchAdminSquadStatus,
} from '../../../../services/adminSquadService';

export default function useSquadManagement() {
  const [sourceRows, setSourceRows] = useState([]);
  const [apiMetrics, setApiMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(SQUAD_FILTER_TABS[0]);
  const [query, setQuery] = useState('');
  const [selectedSquadId, setSelectedSquadId] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [rows, metrics] = await Promise.all([
        fetchAdminSquads(),
        fetchAdminSquadStats().catch(() => null),
      ]);
      setSourceRows(rows.map(mapSquadSummaryFromApi));
      setApiMetrics(metrics);
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to load squads');
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
      return SQUAD_STATS.map((item) =>
        item.id === 'totalSquads'
          ? { ...item, value: String(apiMetrics.totalSquads ?? 0) }
          : item.id === 'activeSquads'
            ? { ...item, value: String(apiMetrics.activeSquads ?? 0) }
            : item.id === 'totalMembers'
              ? { ...item, value: String(apiMetrics.totalMembers ?? 0) }
              : { ...item, value: String(apiMetrics.pendingRequests ?? 0) },
      );
    }
    const total = sourceRows.length;
    const active = sourceRows.filter((s) => s.status === 'ACTIVE').length;
    const members = sourceRows.reduce((sum, s) => sum + Number(s.members || 0), 0);
    const pending = sourceRows.filter((s) => s.status === 'PENDING').length;
    return SQUAD_STATS.map((item) =>
      item.id === 'totalSquads'
        ? { ...item, value: String(total) }
        : item.id === 'activeSquads'
          ? { ...item, value: String(active) }
          : item.id === 'totalMembers'
            ? { ...item, value: String(members) }
            : { ...item, value: String(pending) },
    );
  }, [apiMetrics, sourceRows]);

  const rows = useMemo(() => {
    const tab = activeTab.replace('ALL ', '');
    return sourceRows.filter((s) => {
      const matchesTab = activeTab === 'ALL SQUADS' || s.status === tab;
      const q = query.trim().toLowerCase();
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.handle.toLowerCase().includes(q) ||
        s.leader.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [activeTab, query, sourceRows]);

  const selectedSquad = useMemo(
    () => sourceRows.find((s) => String(s.id) === String(selectedSquadId)) || null,
    [sourceRows, selectedSquadId],
  );

  const patchSquad = useCallback((squadId, patch) => {
    setSourceRows((prev) =>
      prev.map((row) => (String(row.id) === String(squadId) ? { ...row, ...patch } : row)),
    );
  }, []);

  const setSquadStatus = useCallback(
    async (squadId, status) => {
      await patchAdminSquadStatus(squadId, status);
      patchSquad(squadId, { status });
    },
    [patchSquad],
  );

  const disbandSquad = useCallback(
    async (squadId) => {
      await disbandAdminSquad(squadId);
      patchSquad(squadId, { status: 'DISBANDED' });
      setSelectedSquadId((current) => (String(current) === String(squadId) ? null : current));
    },
    [patchSquad],
  );

  return {
    stats,
    rows,
    loading,
    error,
    activeTab,
    setActiveTab,
    query,
    setQuery,
    selectedSquadId,
    setSelectedSquadId,
    selectedSquad,
    patchSquad,
    setSquadStatus,
    disbandSquad,
    reload,
  };
}
