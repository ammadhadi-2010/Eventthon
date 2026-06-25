import React from 'react';
import { TrendingUp } from 'lucide-react';
import { JOB_BOARD_STATS } from './jobBoardUtils';

export default function JobBoardStats({ stats }) {
  const rows = stats?.length ? stats : JOB_BOARD_STATS;
  return (
    <section className="ps-jb-stats ps-jb-stats-grid ps-jb-stats-lane" aria-label="Job board telemetry">
      {rows.map((stat) => (
        <article key={stat.id} className="ps-jb-stat ps-jb-stat--lane-card">
          <p>{stat.label}</p>
          <strong>{stat.value}</strong>
          <span className="ps-jb-stat__delta">
            <TrendingUp size={11} aria-hidden />
            {stat.delta}
          </span>
        </article>
      ))}
    </section>
  );
}
