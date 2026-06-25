import React from 'react';
import ProjectStatCard from './ProjectStatCard';

export default function ProjectStatsHeader({ stats = [] }) {
  return (
    <section className="mb-6 block w-full min-w-0 clear-both">
      <div className="pm-stats-track w-full min-w-0">
        {stats.map((stat) => (
          <div key={stat.id || stat.title} className="pm-stats-track__card min-w-0">
            <ProjectStatCard
              title={stat.title}
              value={stat.value}
              percentage={stat.percentage}
              trend={stat.trend}
              colorTheme={stat.colorTheme}
              icon={stat.icon}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
