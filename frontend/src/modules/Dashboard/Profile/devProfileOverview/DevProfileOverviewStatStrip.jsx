import React from 'react';

function fmtK(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return '—';
  if (x >= 1000) return `${(x / 1000).toFixed(1)}K`;
  return String(Math.round(x));
}

function fmtEarningsK(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return '$0';
  return `$${x.toFixed(1)}K`;
}

export default function DevProfileOverviewStatStrip({ stats }) {
  if (!stats) return null;
  const items = [
    {
      key: 'fol',
      label: 'Followers',
      value: fmtK(stats.followers),
      sub: stats.followers_delta_month ? `+${stats.followers_delta_month} this month` : null,
      tone: 'violet',
    },
    {
      key: 'fing',
      label: 'Following',
      value: String(stats.following ?? '—'),
      sub: null,
      tone: 'cyan',
    },
    {
      key: 'conn',
      label: 'Connections',
      value: fmtK(stats.connections),
      sub: stats.connections_mutual ? `${stats.connections_mutual} mutual` : null,
      tone: 'blue',
    },
    {
      key: 'proj',
      label: 'Projects',
      value: String(stats.projects ?? '0'),
      sub: null,
      tone: 'amber',
    },
    {
      key: 'ord',
      label: 'Completed orders',
      value: String(stats.completed_orders ?? '0'),
      sub: null,
      tone: 'pink',
    },
    {
      key: 'earn',
      label: 'Total earnings',
      value: fmtEarningsK(stats.total_earnings_usd),
      sub: null,
      tone: 'emerald',
    },
  ];

  return (
    <div className="dpo-stat-strip" aria-label="Profile metrics">
      {items.map((it) => (
        <div key={it.key} className={`dpo-stat-card dpo-stat-card--${it.tone}`}>
          <div className="dpo-stat-card__label">{it.label}</div>
          <div className="dpo-stat-card__value">{it.value}</div>
          {it.sub ? <div className="dpo-stat-card__sub">{it.sub}</div> : null}
        </div>
      ))}
    </div>
  );
}
