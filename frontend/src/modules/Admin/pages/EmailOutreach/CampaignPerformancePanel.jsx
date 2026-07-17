import React from 'react';
import { PERFORMANCE_CHART, PERFORMANCE_RATES } from './outreachDashboardData';
import useOutreachStats from './useOutreachStats';

function buildAreaPath(values, width, height) {
  const max = Math.max(...values, 1);
  const step = width / (values.length - 1);
  const points = values.map((v, i) => {
    const x = i * step;
    const y = height - (v / max) * (height - 8) - 4;
    return `${x},${y}`;
  });
  return `M0,${height} L${points.join(' L ')} L${width},${height} Z`;
}

export default function CampaignPerformancePanel({ refreshKey = 0 }) {
  const { rates } = useOutreachStats(refreshKey);
  const width = 560;
  const height = 140;
  const linePath = buildAreaPath(PERFORMANCE_CHART, width, height);

  const rateItems = PERFORMANCE_RATES.map((rate) => {
    if (!rates) return rate;
    const map = {
      open: rates.openRate,
      click: rates.clickRate,
      reply: rates.replyRate,
      bounce: rates.bounceRate,
    };
    return { ...rate, value: map[rate.id] || rate.value };
  });

  return (
    <section className="eo-panel eo-dash-panel">
      <header className="eo-dash-panel__head">
        <h2 className="eo-dash-panel__title">Performance</h2>
        <span className="eo-dash-panel__hint">Last 30 days</span>
      </header>
      <div className="eo-rate-grid">
        {rateItems.map((rate) => (
          <div key={rate.id} className={`eo-rate-pill eo-rate-pill--${rate.tone}`}>
            <p className="eo-rate-pill__label">{rate.label}</p>
            <p className="eo-rate-pill__value">{rate.value}</p>
          </div>
        ))}
      </div>
      <div className="eo-area-chart" aria-hidden>
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="eo-area-chart__svg">
          <defs>
            <linearGradient id="eoAreaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={linePath} fill="url(#eoAreaFill)" />
          <polyline
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="2"
            points={PERFORMANCE_CHART.map((v, i) => {
              const max = Math.max(...PERFORMANCE_CHART, 1);
              const x = (i / (PERFORMANCE_CHART.length - 1)) * width;
              const y = height - (v / max) * (height - 8) - 4;
              return `${x},${y}`;
            }).join(' ')}
          />
        </svg>
      </div>
    </section>
  );
}
