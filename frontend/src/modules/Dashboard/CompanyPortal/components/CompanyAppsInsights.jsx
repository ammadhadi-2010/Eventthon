import React, { useMemo } from 'react';
import { DONUT_COLORS } from '../companyPortalMenu';

export default function CompanyAppsInsights({ metrics, skills }) {
  const segments = metrics?.segments || [];
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
    return `conic-gradient(${parts.join(', ')})`;
  }, [segments]);

  return (
    <div className="cp-mid-row">
      <section className="cp-section cp-glass cp-donut-card">
        <h2 className="cp-section__title">Applications Overview</h2>
        <div className="cp-donut-wrap">
          <div className="cp-donut" style={{ background: gradient }}>
            <div className="cp-donut__center">
              <strong>{total}</strong>
              <span>Total Applications</span>
            </div>
          </div>
          <ul className="cp-donut-legend">
            {segments.map((s) => (
              <li key={s.key}>
                <span className="cp-dot" style={{ background: DONUT_COLORS[s.key] }} />
                <span>{s.label}</span>
                <em>{s.count}</em>
                <b>{s.percent}%</b>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="cp-section cp-glass">
        <h2 className="cp-section__title">Top Skills in Applications</h2>
        <div className="cp-skills">
          {(skills || []).length === 0 ? (
            <p className="cp-empty">No skill tags on applications yet.</p>
          ) : (
            skills.map((row) => (
              <div key={row.name} className="cp-skill-row">
                <div className="cp-skill-row__head">
                  <span>{row.name}</span>
                  <strong>{row.percent}%</strong>
                </div>
                <div className="cp-skill-bar">
                  <span style={{ width: `${row.percent}%` }} />
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
