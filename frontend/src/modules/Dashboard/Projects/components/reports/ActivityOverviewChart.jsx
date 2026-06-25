import React, { useMemo, useState } from 'react';
import { ACTIVITY_MAX, ACTIVITY_WEEK } from '../../data/reportsData';

const W = 300;
const H = 120;
const PAD = { t: 12, r: 12, b: 28, l: 32 };

function scaleY(v, max) {
  const inner = H - PAD.t - PAD.b;
  return PAD.t + inner - (v / max) * inner;
}

export default function ActivityOverviewChart() {
  const [hover, setHover] = useState(null);
  const max = ACTIVITY_MAX;
  const innerW = W - PAD.l - PAD.r;

  const points = useMemo(() => {
    const step = innerW / (ACTIVITY_WEEK.length - 1);
    return ACTIVITY_WEEK.map((d, i) => ({
      ...d,
      x: PAD.l + i * step,
      y: scaleY(d.value, max),
    }));
  }, [max]);

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaPath = `${linePath} L${points[points.length - 1].x},${H - PAD.b} L${points[0].x},${H - PAD.b} Z`;

  const yTicks = [0, 10, 20, 30, 40, 50];

  return (
    <article className="ph-card ph-rpt-chart-card">
      <h3 className="ph-rpt-chart-title">Activity Overview</h3>
      <div className="ph-rpt-line-wrap">
        <svg className="ph-rpt-line" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Weekly activity chart">
          <defs>
            <linearGradient id="ph-rpt-area-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
            </linearGradient>
          </defs>
          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={PAD.l}
                y1={scaleY(tick, max)}
                x2={W - PAD.r}
                y2={scaleY(tick, max)}
                className="ph-rpt-grid-line"
              />
              <text x={PAD.l - 6} y={scaleY(tick, max) + 4} className="ph-rpt-axis-y" textAnchor="end">
                {tick}
              </text>
            </g>
          ))}
          <path d={areaPath} fill="url(#ph-rpt-area-grad)" />
          <path d={linePath} className="ph-rpt-line-path" fill="none" />
          {points.map((p) => (
            <g key={p.day}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hover?.day === p.day ? 6 : 4}
                className="ph-rpt-line-dot"
                onMouseEnter={() => setHover(p)}
                onMouseLeave={() => setHover(null)}
              />
              <text x={p.x} y={H - 8} className="ph-rpt-axis-x" textAnchor="middle">
                {p.day}
              </text>
            </g>
          ))}
        </svg>
        {hover ? (
          <div
            className="ph-rpt-tooltip"
            style={{ left: `${((hover.x - PAD.l) / innerW) * 100}%` }}
          >
            {hover.value}
          </div>
        ) : null}
      </div>
    </article>
  );
}
