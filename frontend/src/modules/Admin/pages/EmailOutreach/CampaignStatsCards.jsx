import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import useOutreachStats from './useOutreachStats';

export default function CampaignStatsCards({ refreshKey = 0 }) {
  const { stats, loading } = useOutreachStats(refreshKey);

  return (
    <div className="eo-stats-grid">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <article key={stat.id} className="eo-stat-card">
            <div className="eo-stat-card__row">
              <div>
                <p className="eo-stat-card__label">{stat.label}</p>
                <p className="eo-stat-card__value">{loading ? '…' : stat.value}</p>
              </div>
              <span className="eo-stat-card__icon" style={{ color: stat.color, backgroundColor: `${stat.color}18` }}>
                <Icon size={16} strokeWidth={2} />
              </span>
            </div>
            <p className="eo-stat-card__trend">
              <TrendingUp size={12} aria-hidden />
              {stat.trend} vs last month
            </p>
          </article>
        );
      })}
    </div>
  );
}
