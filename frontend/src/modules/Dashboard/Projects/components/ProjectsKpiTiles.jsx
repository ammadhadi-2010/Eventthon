import React, { useMemo } from 'react';
import { BUDGET_SUMMARY, KPI_METRICS } from '../data/projectsHubData';
import KpiSparkline from './KpiSparkline';

const BUDGET_SPARK = 'M0 20 L10 16 L20 12 L30 8 L40 4';

function KpiCard({ kpi, mobileSwipe = false }) {
  return (
    <article
      className={`ph-kpi-card ph-kpi-card--${kpi.tone}${
        mobileSwipe ? ' projects-mobile-swipe-lane__item' : ''
      }`}
    >
      <p className="ph-kpi-label">{kpi.label}</p>
      <strong className="ph-kpi-value">{kpi.value}</strong>
      <span className={`ph-kpi-delta${kpi.delta?.startsWith('-') ? ' is-down' : ''}`}>{kpi.delta}</span>
      <KpiSparkline path={kpi.spark || 'M0 20 L40 8'} tone={kpi.tone} />
    </article>
  );
}

export default function ProjectsKpiTiles({ kpis = KPI_METRICS, budgetSummary = BUDGET_SUMMARY }) {
  const tiles = useMemo(
    () => [
      ...kpis,
      {
        id: 'budget',
        label: budgetSummary.label,
        value: budgetSummary.value,
        delta: budgetSummary.delta,
        tone: 'amber',
        spark: BUDGET_SPARK,
      },
    ],
    [kpis, budgetSummary],
  );

  return (
    <section className="ph-kpi-block" aria-label="Project metrics">
      <div className="ph-kpi-grid ph-kpi-grid--desktop">
        {tiles.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} />
        ))}
      </div>
      <div className="ph-kpi-mobile">
        <div className="ph-kpi-grid ph-kpi-mobile-swipe projects-mobile-swipe-lane">
          {tiles.map((kpi) => (
            <KpiCard key={kpi.id} kpi={kpi} mobileSwipe />
          ))}
        </div>
      </div>
    </section>
  );
}
