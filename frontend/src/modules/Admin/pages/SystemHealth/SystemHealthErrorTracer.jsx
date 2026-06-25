import React from 'react';

export default function SystemHealthErrorTracer({
  traceQuery,
  onTraceQueryChange,
  levelFilter,
  onLevelFilterChange,
  traceMatches,
  filteredCount,
}) {
  return (
    <div className="admin-card-dark sh-page-card p-5">
      <div className="mb-4">
        <h3 className="text-lg font-black">Error Tracer</h3>
        <p className="text-xs text-slate-500">
          Filter anomalies and isolate failing services across probe history.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {['all', 'error', 'warn', 'info'].map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => onLevelFilterChange(level)}
            className={`rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] ${
              levelFilter === level ? 'bg-violet-500/20 text-violet-300' : 'bg-white/[0.03] text-slate-500'
            }`}
          >
            {level}
          </button>
        ))}
      </div>

      <input
        type="search"
        value={traceQuery}
        onChange={(e) => onTraceQueryChange(e.target.value)}
        placeholder="Trace by service, status, or error detail…"
        className="mb-4 w-full rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-sm text-slate-200 outline-none focus:border-violet-500/40"
      />

      <p className="mb-3 text-xs text-slate-500">{filteredCount} log entries match current filters.</p>

      <div className="space-y-2">
        {traceMatches.length === 0 ? (
          <p className="text-sm text-slate-500">No traced service matches yet.</p>
        ) : (
          traceMatches.map((match) => (
            <div key={`${match.logId}-${match.service.id}`} className="sh-trace-row">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-bold text-slate-200">{match.service.label}</span>
                <span className="text-[10px] uppercase tracking-wider text-slate-500">{match.at}</span>
              </div>
              <p className="mt-1 text-xs text-slate-400">{match.service.detail || 'No detail'}</p>
              <span className="mt-2 inline-flex rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-300">
                {match.service.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
