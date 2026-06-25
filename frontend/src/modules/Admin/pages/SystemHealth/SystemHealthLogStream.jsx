import React from 'react';

function formatAt(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function SystemHealthLogStream({ logs, loading }) {
  return (
    <div className="admin-card-dark sh-page-card p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-black">Operational Logs</h3>
          <p className="text-xs text-slate-500">Live probe history from microservice health checks.</p>
        </div>
        <span className="admin-chip px-3 py-1 text-[10px] font-bold uppercase text-slate-400">
          {logs.length} entries
        </span>
      </div>
      <div className="sh-log-stream max-h-[320px] space-y-2 overflow-y-auto pr-1">
        {loading && logs.length === 0 ? (
          <p className="text-sm text-slate-500">Running initial probes…</p>
        ) : null}
        {logs.map((entry) => (
          <div key={entry.id} className={`sh-log-row sh-log-row--${entry.level}`}>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {formatAt(entry.at)}
              </span>
              <span className={`sh-log-pill sh-log-pill--${entry.level}`}>{entry.overall}</span>
            </div>
            <p className="mt-1 text-sm text-slate-300">{entry.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
