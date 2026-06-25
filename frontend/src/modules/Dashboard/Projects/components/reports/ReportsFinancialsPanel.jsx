import React from 'react';
import ReportsKpiRow from './ReportsKpiRow';
import ReportsBudgetChart from './ReportsBudgetChart';
import {
  REPORTS_FINANCIALS_KPIS,
  REPORTS_FINANCIALS_MONTHLY,
  REPORTS_FINANCIALS_ROWS,
} from '../../data/reportsTabData';

function FinancialMobileCard({ row }) {
  return (
    <article className="ph-rpt-mobile-card ph-rpt-fin-card">
      <strong className="ph-rpt-td-strong">{row.project}</strong>
      <div className="ph-rpt-fin-metrics">
        <div className="ph-rpt-fin-row">
          <span>Budget</span>
          <strong>{row.budget}</strong>
        </div>
        <div className="ph-rpt-fin-row ph-rpt-fin-row--spent">
          <span>Spent</span>
          <strong>{row.spent}</strong>
        </div>
        <div className="ph-rpt-fin-row">
          <span>Remaining</span>
          <strong>{row.remaining}</strong>
        </div>
      </div>
    </article>
  );
}

export default function ReportsFinancialsPanel() {
  return (
    <>
      <ReportsKpiRow items={REPORTS_FINANCIALS_KPIS} ariaLabel="Financial report metrics" />
      <div className="ph-rpt-charts-row">
        <ReportsBudgetChart title="Budget vs Spent" rows={REPORTS_FINANCIALS_MONTHLY} />
        <section className="ph-card ph-rpt-chart-card ph-rpt-table-card">
          <h3 className="ph-rpt-chart-title">Project Budgets</h3>
          <div className="ph-rpt-mobile-list" aria-label="Project budgets list">
            {REPORTS_FINANCIALS_ROWS.map((row) => (
              <FinancialMobileCard key={row.id} row={row} />
            ))}
          </div>
          <div className="ph-table-scroll">
            <table className="ph-table ph-rpt-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Budget</th>
                  <th>Spent</th>
                  <th>Remaining</th>
                </tr>
              </thead>
              <tbody>
                {REPORTS_FINANCIALS_ROWS.map((row) => (
                  <tr key={row.id}>
                    <td className="ph-rpt-td-strong">{row.project}</td>
                    <td>{row.budget}</td>
                    <td className="ph-rpt-td-spent">{row.spent}</td>
                    <td className="ph-rpt-td-muted">{row.remaining}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}
