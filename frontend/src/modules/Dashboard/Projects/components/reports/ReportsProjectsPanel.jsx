import React from 'react';
import ReportsKpiRow from './ReportsKpiRow';
import ReportsBarChart from './ReportsBarChart';
import StatusBadge from '../myProjects/StatusBadge';
import MyProjectsProgress from '../myProjects/MyProjectsProgress';
import {
  REPORTS_CATEGORY_BARS,
  REPORTS_PROJECTS_KPIS,
  REPORTS_PROJECTS_ROWS,
} from '../../data/reportsTabData';

export default function ReportsProjectsPanel() {
  return (
    <>
      <ReportsKpiRow items={REPORTS_PROJECTS_KPIS} ariaLabel="Project report metrics" />
      <div className="ph-rpt-charts-row">
        <section className="ph-card ph-rpt-chart-card ph-rpt-table-card">
          <h3 className="ph-rpt-chart-title">Project Performance</h3>
          <div className="ph-table-scroll">
            <table className="ph-table ph-rpt-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Lead</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Progress</th>
                </tr>
              </thead>
              <tbody>
                {REPORTS_PROJECTS_ROWS.map((row) => (
                  <tr key={row.id}>
                    <td className="ph-rpt-td-strong">{row.name}</td>
                    <td>{row.lead}</td>
                    <td className="ph-rpt-td-muted">{row.category}</td>
                    <td>
                      <StatusBadge status={row.status} />
                    </td>
                    <td>
                      <MyProjectsProgress value={row.progress} status={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <ReportsBarChart
          title="By Category"
          items={REPORTS_CATEGORY_BARS}
          barClass="ph-rpt-bar-fill--blue"
        />
      </div>
    </>
  );
}
