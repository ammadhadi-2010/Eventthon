import React, { useMemo } from 'react';
import { REPORTS_PROGRESS_SEGMENTS } from '../../data/reportsData';

const R = 42;
const C = 2 * Math.PI * R;

function arcProps(startPct, sweepPct) {
  const start = (startPct / 100) * C;
  const len = (sweepPct / 100) * C;
  return { strokeDasharray: `${len} ${C}`, strokeDashoffset: C - start };
}

const TONE_COLORS = { green: '#22c55e', blue: '#3b82f6', red: '#ef4444', violet: '#8b5cf6' };

function mapApiSlices(slices) {
  const total = slices.reduce((sum, s) => sum + (s.value || 0), 0) || 1;
  return slices.map((seg, i) => ({
    id: seg.label?.toLowerCase().replace(/\s+/g, '-') || `seg-${i}`,
    label: seg.label,
    count: seg.value,
    pct: Math.round((seg.value / total) * 100),
    color: TONE_COLORS[seg.tone] || '#6366f1',
  }));
}

export default function ProjectsProgressDonut({ slices }) {
  const source = slices?.length ? mapApiSlices(slices) : REPORTS_PROGRESS_SEGMENTS;
  const segments = useMemo(() => {
    let cursor = 0;
    return source.map((seg) => {
      const start = cursor;
      cursor += seg.pct;
      return { ...seg, ...arcProps(start, seg.pct) };
    });
  }, [source]);

  return (
    <article className="ph-card ph-rpt-chart-card ph-rpt-chart-card--centered">
      <h3 className="ph-rpt-chart-title">Projects Progress</h3>
      <div className="ph-rpt-donut-wrap">
        <svg className="ph-rpt-donut" viewBox="0 0 120 120" aria-hidden>
          <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" />
          {segments.map((seg) => (
            <circle
              key={seg.id}
              cx="60"
              cy="60"
              r={R}
              fill="none"
              stroke={seg.color}
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={seg.strokeDasharray}
              strokeDashoffset={seg.strokeDashoffset}
              transform="rotate(-90 60 60)"
            />
          ))}
        </svg>
        <ul className="ph-rpt-donut-legend">
          {source.map((seg) => (
            <li key={seg.id}>
              <span className="ph-rpt-legend-dot" style={{ background: seg.color }} aria-hidden />
              <span>
                {seg.label} <strong>{seg.pct}%</strong> ({seg.count})
              </span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
