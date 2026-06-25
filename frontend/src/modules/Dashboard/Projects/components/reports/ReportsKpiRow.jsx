import React from 'react';

export default function ReportsKpiRow({ items, ariaLabel = 'Summary metrics' }) {
  return (
    <div className="ph-rpt-summary" aria-label={ariaLabel}>
      {items.map((card) => (
        <article key={card.id} className="ph-rpt-summary-card">
          <p className="ph-rpt-summary-label">{card.label}</p>
          <strong className="ph-rpt-summary-value">{card.value}</strong>
          <span className={`ph-rpt-summary-delta ph-rpt-summary-delta--${card.trend}`}>{card.delta}</span>
        </article>
      ))}
    </div>
  );
}
