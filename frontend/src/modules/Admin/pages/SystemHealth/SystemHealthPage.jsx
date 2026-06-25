import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import SystemHealthServicesList from '../../sections/health/SystemHealthServicesList';
import SystemHealthErrorTracer from './SystemHealthErrorTracer';
import SystemHealthLogStream from './SystemHealthLogStream';
import useSystemHealthPage from './useSystemHealthPage';
import './systemHealth.css';

function overallCopy(overall) {
  if (overall === 'DOWN') return 'One or more systems are down';
  if (overall === 'DEGRADED') return 'Some systems need attention';
  return 'All systems operational';
}

export default function SystemHealthPage() {
  const {
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
  } = useSystemHealthPage();

  const overall = String(health?.overall || 'DEGRADED').toUpperCase();

  return (
    <div className="sh-page">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link to="/admin-control" className="mb-2 inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white">
            <ArrowLeft size={14} aria-hidden />
            Back to Dashboard
          </Link>
          <h1 className="text-[28px] font-black tracking-tight text-white">System Health</h1>
          <p className="mt-1 text-sm text-slate-400">
            {loading ? 'Running live probes…' : error || overallCopy(overall)}
          </p>
        </div>
        <button type="button" className="admin-health-refresh inline-flex items-center gap-2" onClick={onRefresh} aria-busy={loading}>
          <RefreshCw size={14} aria-hidden />
          {loading ? 'Refreshing…' : 'Refresh Probes'}
        </button>
      </div>

      <div className="sh-page-grid">
        <div className="admin-card-dark sh-page-card p-5">
          <h3 className="mb-4 text-lg font-black">Microservices</h3>
          <SystemHealthServicesList health={health} />
        </div>
        <SystemHealthLogStream logs={logs} loading={loading} />
        <SystemHealthErrorTracer
          traceQuery={traceQuery}
          onTraceQueryChange={setTraceQuery}
          levelFilter={levelFilter}
          onLevelFilterChange={setLevelFilter}
          traceMatches={traceMatches}
          filteredCount={filteredLogs.length}
        />
      </div>
    </div>
  );
}
