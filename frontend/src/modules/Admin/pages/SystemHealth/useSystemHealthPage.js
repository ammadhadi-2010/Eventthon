import { useCallback, useEffect, useMemo, useState } from 'react';
import useSystemHealth from '../../hooks/useSystemHealth';

const MAX_LOGS = 80;

function buildLogEntry(health, error) {
  const checkedAt = health?.last_checked || new Date().toISOString();
  const services = health?.services || [];
  const anomalies = services.filter((row) => String(row.status).toUpperCase() !== 'OPERATIONAL');
  return {
    id: `${checkedAt}-${Math.random().toString(36).slice(2, 7)}`,
    at: checkedAt,
    overall: String(health?.overall || (error ? 'DOWN' : 'DEGRADED')).toUpperCase(),
    message: error || (anomalies.length ? `${anomalies.length} service(s) need attention` : 'All probes passed'),
    services,
    level: error || String(health?.overall).toUpperCase() === 'DOWN' ? 'error' : anomalies.length ? 'warn' : 'info',
  };
}

export default function useSystemHealthPage() {
  const { health, loading, error, refresh } = useSystemHealth();
  const [logs, setLogs] = useState([]);
  const [traceQuery, setTraceQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');

  useEffect(() => {
    if (!health && !error) return;
    setLogs((prev) => [buildLogEntry(health, error), ...prev].slice(0, MAX_LOGS));
  }, [health, error]);

  const filteredLogs = useMemo(() => {
    const needle = traceQuery.trim().toLowerCase();
    return logs.filter((entry) => {
      if (levelFilter !== 'all' && entry.level !== levelFilter) return false;
      if (!needle) return true;
      const blob = `${entry.message} ${entry.overall} ${(entry.services || [])
        .map((s) => `${s.label} ${s.detail} ${s.status}`)
        .join(' ')}`.toLowerCase();
      return blob.includes(needle);
    });
  }, [logs, levelFilter, traceQuery]);

  const traceMatches = useMemo(() => {
    if (!traceQuery.trim()) return [];
    const needle = traceQuery.trim().toLowerCase();
    const matches = [];
    logs.forEach((entry) => {
      (entry.services || []).forEach((service) => {
        const blob = `${service.label} ${service.detail} ${service.status}`.toLowerCase();
        if (blob.includes(needle)) {
          matches.push({ logId: entry.id, at: entry.at, service });
        }
      });
    });
    return matches.slice(0, 12);
  }, [logs, traceQuery]);

  const onRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  return {
    health,
    loading,
    error,
    logs,
    filteredLogs,
    traceMatches,
    traceQuery,
    setTraceQuery,
    levelFilter,
    setLevelFilter,
    onRefresh,
  };
}
