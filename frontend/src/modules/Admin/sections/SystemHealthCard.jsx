import React, { useMemo } from 'react';
import SystemHealthServicesList from './health/SystemHealthServicesList';

function overallCopy(overall) {
  if (overall === 'DOWN') return 'One or more systems are down';
  if (overall === 'DEGRADED') return 'Some systems need attention';
  return 'All systems operational';
}

function formatCheckedAt(value) {
  if (!value) return 'CHECKING…';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'UPDATED JUST NOW';
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `UPDATED ${time}`;
}

export default function SystemHealthCard({ health, loading, error, onRefresh }) {
  const overall = useMemo(() => String(health?.overall || 'DEGRADED').toUpperCase(), [health]);

  return (
    <div className="admin-card-dark overflow-hidden p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-lg font-black">System Health</h3>
          <p className="text-xs text-slate-500">
            {loading ? 'Running live probes…' : error || overallCopy(overall)}
          </p>
          <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">
            {formatCheckedAt(health?.last_checked)}
          </p>
        </div>
        <button
          type="button"
          className="admin-health-refresh shrink-0"
          onClick={() => onRefresh?.()}
          aria-busy={loading}
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>
      <SystemHealthServicesList health={health} />
    </div>
  );
}
