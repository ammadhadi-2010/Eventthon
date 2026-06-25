import React, { useMemo } from 'react';

export default function ReportsSimpleLineChart({ title, series, max = 50 }) {
  const W = 300;
  const H = 120;
  const PAD = { t: 12, r: 12, b: 28, l: 32 };

  const points = useMemo(() => {
    const innerW = W - PAD.l - PAD.r;
    const step = innerW / Math.max(1, series.length - 1);
    return series.map((d, i) => ({
      ...d,
      label: d.day || d.month,
      x: PAD.l + i * step,
      y: PAD.t + (H - PAD.t - PAD.b) * (1 - d.value / max),
    }));
  }, [series, max]);

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaPath = `${linePath} L${points[points.length - 1].x},${H - PAD.b} L${points[0].x},${H - PAD.b} Z`;

  return (
    <article className="ph-card ph-rpt-chart-card">
      <h3 className="ph-rpt-chart-title">{title}</h3>
      <svg className="ph-rpt-line" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={title}>
        <defs>
          <linearGradient id="ph-rpt-line-grad-team" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#ph-rpt-line-grad-team)" />
        <path d={linePath} className="ph-rpt-line-path" fill="none" />
        {points.map((p) => (
          <g key={p.label}>
            <circle cx={p.x} cy={p.y} r={4} className="ph-rpt-line-dot" />
            <text x={p.x} y={H - 8} className="ph-rpt-axis-x" textAnchor="middle">
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    </article>
  );
}
