import React from 'react';
import { FUNDING_KPI_METRICS } from '../../data/fundingData';

export default function FundingKpiRow() {
  return (
    <div className="ph-fund-kpi-grid" aria-label="Funding metrics">
      {FUNDING_KPI_METRICS.map((kpi) => (
        <article key={kpi.id} className="ph-fund-kpi-card">
          <p className="ph-kpi-label">{kpi.label}</p>
          <strong className="ph-fund-kpi-value">{kpi.value}</strong>
          <span className="ph-fund-kpi-delta">{kpi.delta}</span>
        </article>
      ))}
    </div>
  );
}
