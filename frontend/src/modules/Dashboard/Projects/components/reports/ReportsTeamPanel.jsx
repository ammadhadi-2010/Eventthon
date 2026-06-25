import React from 'react';
import ReportsKpiRow from './ReportsKpiRow';
import ReportsSimpleLineChart from './ReportsSimpleLineChart';
import { REPORTS_TEAM_KPIS, REPORTS_TEAM_LOAD, REPORTS_TEAM_ROWS } from '../../data/reportsTabData';

function TeamMobileCard({ row }) {
  return (
    <article className="ph-rpt-mobile-card ph-rpt-team-card">
      <div className="ph-rpt-mobile-top">
        <div className="ph-rpt-member">
          <span className="ph-rpt-member-av">{row.initials}</span>
          <span className="ph-rpt-td-strong">{row.name}</span>
        </div>
        <span className="ph-rpt-team-tasks">{row.tasks} tasks</span>
      </div>
      <span className="ph-rpt-mobile-role">{row.role}</span>
      <div className="ph-rpt-util">
        <div className="ph-rpt-util-track">
          <span style={{ width: `${row.utilization}%` }} />
        </div>
        <span>{row.utilization}%</span>
      </div>
    </article>
  );
}

export default function ReportsTeamPanel() {
  return (
    <>
      <ReportsKpiRow items={REPORTS_TEAM_KPIS} ariaLabel="Team report metrics" />
      <div className="ph-rpt-charts-row">
        <section className="ph-card ph-rpt-chart-card ph-rpt-table-card">
          <h3 className="ph-rpt-chart-title">Team Workload</h3>
          <div className="ph-rpt-mobile-list" aria-label="Team members list">
            {REPORTS_TEAM_ROWS.map((row) => (
              <TeamMobileCard key={row.id} row={row} />
            ))}
          </div>
          <div className="ph-table-scroll">
            <table className="ph-table ph-rpt-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Role</th>
                  <th>Utilization</th>
                  <th>Open Tasks</th>
                </tr>
              </thead>
              <tbody>
                {REPORTS_TEAM_ROWS.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className="ph-rpt-member">
                        <span className="ph-rpt-member-av">{row.initials}</span>
                        <span className="ph-rpt-td-strong">{row.name}</span>
                      </div>
                    </td>
                    <td className="ph-rpt-td-muted">{row.role}</td>
                    <td>
                      <div className="ph-rpt-util">
                        <div className="ph-rpt-util-track">
                          <span style={{ width: `${row.utilization}%` }} />
                        </div>
                        <span>{row.utilization}%</span>
                      </div>
                    </td>
                    <td>{row.tasks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <ReportsSimpleLineChart title="Weekly Capacity" series={REPORTS_TEAM_LOAD} max={50} />
      </div>
    </>
  );
}
