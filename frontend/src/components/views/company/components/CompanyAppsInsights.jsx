import React, { useMemo } from 'react';
import { DONUT_COLORS } from '../companyPortalMenu';

const SKILL_TONES = ['violet', 'cyan', 'green'];
const SKILL_TONE_CLASS = {
  violet: 'cp-skill-capsule--violet',
  cyan: 'cp-skill-capsule--cyan',
  green: 'cp-skill-capsule--green',
};

export default function CompanyAppsInsights({ metrics, skills }) {
  const segments = metrics?.segments || [];
  const total = metrics?.total ?? 0;
  const skillRows = (skills || []).map((row, index) => ({
    ...row,
    tone: row.tone || SKILL_TONES[index % SKILL_TONES.length],
  }));
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

      <section className="cp-section cp-glass cp-skills-panel">
        <h2 className="cp-section__title">Top Skills in Applications</h2>
        {skillRows.length === 0 ? (
          <p className="cp-empty">No application skill data yet.</p>
        ) : (
          <>
            <div className="cp-skill-capsules" aria-label="Top skill tags">
              {skillRows.map((row) => (
                <span
                  key={row.name}
                  className={`cp-skill-capsule ${SKILL_TONE_CLASS[row.tone] || SKILL_TONE_CLASS.violet}`}
                >
                  {row.name} {row.percent}%
                </span>
              ))}
            </div>
            <div className="cp-skills">
              {skillRows.map((row) => (
                <div key={`bar-${row.name}`} className="cp-skill-row">
                  <div className="cp-skill-row__head">
                    <span>{row.name}</span>
                    <strong>{row.percent}%</strong>
                  </div>
                  <div className={`cp-skill-bar cp-skill-bar--${row.tone || 'violet'}`}>
                    <span style={{ width: `${row.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
