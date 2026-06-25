import React from 'react';

export default function ReportsBudgetChart({ title, rows }) {
  const max = Math.max(...rows.flatMap((r) => [r.budget, r.spent]), 1);

  return (
    <article className="ph-card ph-rpt-chart-card">
      <h3 className="ph-rpt-chart-title">{title}</h3>
      <div className="ph-rpt-budget-legend">
        <span>
          <i className="ph-rpt-legend-sq ph-rpt-legend-sq--budget" /> Budget
        </span>
        <span>
          <i className="ph-rpt-legend-sq ph-rpt-legend-sq--spent" /> Spent
        </span>
      </div>
      <ul className="ph-rpt-budget-bars">
        {rows.map((row) => (
          <li key={row.month}>
            <span className="ph-rpt-budget-month">{row.month}</span>
            <div className="ph-rpt-budget-pair">
              <span className="ph-rpt-budget-fill ph-rpt-budget-fill--budget" style={{ width: `${(row.budget / max) * 100}%` }} />
              <span className="ph-rpt-budget-fill ph-rpt-budget-fill--spent" style={{ width: `${(row.spent / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}
