import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export default function CompanyStats({ stats }) {
  return (
    <div className="cm-stats-lock um-stats-track cm-stats-grid flex w-full min-w-0 flex-row gap-3 overflow-x-auto px-1 scrollbar-none snap-x snap-mandatory lg:grid lg:grid-cols-5 lg:gap-4 lg:overflow-visible lg:snap-none">
      {stats.map((stat) => {
        const StatIcon = stat.icon;
        return (
          <div
            key={stat.id}
            className={`um-stat-card cm-stat-card cm-stat-card--${stat.id} shrink-0 snap-start shadow-lg lg:w-auto lg:shrink`}
          >
            <div className="um-stat-card__row">
              <div className="um-stat-card__text min-w-0">
                <p className="um-stat-label">{stat.label}</p>
                <p className="um-stat-value">{stat.value}</p>
              </div>
              <div className="um-stat-icon cm-stat-icon" style={{ color: stat.color, backgroundColor: `${stat.color}22` }}>
                <StatIcon size={16} strokeWidth={2} />
              </div>
            </div>
            <div className="um-stat-meta">
              <span className="um-stat-delta um-stat-delta--up">
                <ArrowUpRight size={11} />
                {stat.change}
              </span>
              <span className="um-stat-detail">{stat.detail}</span>
            </div>
            <div className="cm-stat-bar" style={{ background: `linear-gradient(90deg, ${stat.color}88, transparent)` }} />
          </div>
        );
      })}
    </div>
  );
}
