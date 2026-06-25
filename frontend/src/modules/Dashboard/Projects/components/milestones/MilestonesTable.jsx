import React from 'react';
import MilestoneStatusBadge from './MilestoneStatusBadge';
import MilestoneProgressCell from './MilestoneProgressCell';
import { resolveMilestoneLabel, resolveProjectLabel } from './milestoneRowMap';

function MilestoneCell({ row }) {
  const milestoneLabel = resolveMilestoneLabel(row);
  return (
    <div className="ph-ms-milestone">
      <span className={`ph-ms-accent ph-ms-accent--${row.accent}`} aria-hidden />
      <span className="ph-ms-milestone-name">{milestoneLabel}</span>
    </div>
  );
}
function MilestoneMobileCard({ row }) {
  return (
    <article className="ph-mp-mobile-card ph-ms-mobile-card">
      <div className="ph-mp-mobile-top">
        <MilestoneCell row={row} />
        <MilestoneStatusBadge status={row.status} />
      </div>
      <div className="ph-ms-mobile-meta">
        <span>{resolveProjectLabel(row)}</span>
        <span>{row.dueDate}</span>
      </div>      <MilestoneProgressCell progress={row.progress} status={row.status} />
    </article>
  );
}

export default function MilestonesTable({ rows }) {
  return (
    <section className="ph-card ph-ms-table-card">
      <div className="ph-mp-mobile-list" aria-label="Milestones list">
        {rows.length === 0 ? (
          <p className="ph-table-empty">No milestones for this project.</p>
        ) : (
          rows.map((row) => <MilestoneMobileCard key={row.id} row={row} />)
        )}
      </div>
      <div className="ph-table-scroll">
        <table className="ph-table ph-ms-table">
          <thead>
            <tr>
              <th>Milestone</th>
              <th>Project</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Progress</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="ph-table-empty">
                  No milestones for this project.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="ph-mp-row">
                  <td>
                    <MilestoneCell row={row} />
                  </td>
                  <td className="ph-ms-project">{resolveProjectLabel(row)}</td>                  <td className="ph-ms-date">{row.dueDate}</td>
                  <td>
                    <MilestoneStatusBadge status={row.status} />
                  </td>
                  <td>
                    <MilestoneProgressCell progress={row.progress} status={row.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
