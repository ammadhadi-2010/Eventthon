import React, { useMemo } from 'react';
import { DONUT_COLORS } from '../companyPortalMenu';

export default function CompanyAppsInsights({ metrics }) {
  const segments = useMemo(() => metrics?.segments || [], [metrics?.segments]);
  const total = metrics?.total ?? 0;
  const gradient = useMemo(() => {
    if (!segments.length) return 'conic-gradient(#334155 0deg 360deg)';
    let cursor = 0;
    const parts = segments
      .filter((s) => s.count > 0)
      .map((s) => {
        const slice = (s.percent / 100) * 360;
        const start = cursor;
        cursor += slice;
        const color = DONUT_COLORS[s.key] || '#64748b';
        return `${color} ${start}deg ${cursor}deg`;
      });
    if (!parts.length) return 'conic-gradient(#334155 0deg 360deg)';
    return `conic-gradient(${parts.join(', ')})`;
  }, [segments]);

  return (
    <section className="cp-section cp-glass cp-donut-card">
      <h2 className="cp-section__title">Applications Overview</h2>
      <div className="cp-donut-wrap">
        <div className="cp-donut-stage">
          <div className="cp-donut" style={{ background: gradient }}>
            <div className="cp-donut__center">
              <strong>{total.toLocaleString?.() ?? total}</strong>
              <span>Total</span>
            </div>
          </div>
        </div>
        <ul className="cp-donut-legend">
          {segments.map((s) => (
            <li key={s.key} className={`cp-donut-legend__row cp-donut-legend__row--${s.key}`}>
              <span className="cp-dot" style={{ background: DONUT_COLORS[s.key] }} />
              <span className="cp-donut-legend__label">{s.label}</span>
              <em>{s.count}</em>
              <b>{s.percent}%</b>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
