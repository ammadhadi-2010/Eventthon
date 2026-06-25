import React from 'react';
import { JOB_STAT_DEFS, JOB_STAT_GRID_IDS } from './jobData';

export default function JobManagementStats({ stats }) {
  const visible = stats.filter((stat) => JOB_STAT_GRID_IDS.includes(stat.id));

  return (
    <div className="jm-stats-lock um-stats-track um-stats-track--cols-4 mb-4 flex w-full min-w-0 flex-row gap-3 overflow-x-auto px-1 scrollbar-none snap-x snap-mandatory lg:grid lg:grid-cols-4 lg:gap-4 lg:overflow-visible lg:snap-none">
      {visible.map((stat) => {
        const Icon = JOB_STAT_DEFS.find((d) => d.id === stat.id)?.icon;
        return (
          <div
            key={stat.id}
            className="um-stat-card min-w-0 w-[calc(50%-12px)] shrink-0 snap-start shadow-lg lg:w-auto lg:shrink"
          >
            <div className="um-stat-card__row">
              <div className="um-stat-card__text min-w-0">
                <p className="um-stat-label">{stat.label}</p>
                <p className="um-stat-value">{stat.value}</p>
              </div>
              {Icon ? (
                <div className="um-stat-icon" style={{ color: stat.color, backgroundColor: `${stat.color}18` }}>
                  <Icon size={16} strokeWidth={2} />
                </div>
              ) : null}
            </div>
            <p className="jm-stat-foot">{stat.change}</p>
          </div>
        );
      })}
    </div>
  );
}
