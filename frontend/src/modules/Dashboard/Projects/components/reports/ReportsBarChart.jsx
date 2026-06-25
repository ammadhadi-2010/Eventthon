import React from 'react';

export default function ReportsBarChart({ title, items, maxValue, barClass = 'ph-rpt-bar-fill--purple' }) {
  const max = maxValue || Math.max(...items.map((i) => i.value), 1);

  return (
    <article className="ph-card ph-rpt-chart-card">
      <h3 className="ph-rpt-chart-title">{title}</h3>
      <ul className="ph-rpt-bars">
        {items.map((item) => (
          <li key={item.label}>
            <span className="ph-rpt-bars__label">{item.label}</span>
            <div className="ph-rpt-bars__track">
              <span
                className={`ph-rpt-bars__fill ${barClass}`}
                style={{ width: `${(item.pct ?? (item.value / max) * 100)}%` }}
              />
            </div>
            {item.value != null ? <span className="ph-rpt-bars__val">{item.value}</span> : null}
          </li>
        ))}
      </ul>
    </article>
  );
}
