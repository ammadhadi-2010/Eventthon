import React from 'react';
import { AUTOMATION_STAT_DEFS } from './automationData';

export default function AutomationStats({ stats }) {
  return (
    <div className="auto-stats-lock um-stats-track mb-4 flex w-full min-w-0 flex-row gap-3 overflow-x-auto px-1 scrollbar-none snap-x snap-mandatory lg:grid lg:grid-cols-5 lg:gap-4 lg:overflow-visible lg:snap-none">
      {stats.map((stat) => {
        const Icon = AUTOMATION_STAT_DEFS.find((d) => d.id === stat.id)?.icon;
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
            <p className="auto-stat-foot">{stat.change}</p>
          </div>
        );
      })}
    </div>
  );
}
