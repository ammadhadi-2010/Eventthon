import React from 'react';
import {
  COMPANY_HERO_STAT_TONES,
  COMPANY_HERO_STATS,
  getCompanyHeroStatValue,
} from '../data/companyHeroStats';

export default function CompanyHeroStatsStrip({ company }) {
  if (!company) return null;

  return (
    <div className="cp-hero__stats-strip" aria-label="Company metrics">
      {COMPANY_HERO_STATS.map((item, index) => {
        const tone = COMPANY_HERO_STAT_TONES[index % COMPANY_HERO_STAT_TONES.length];
        return (
          <article
            key={item.key}
            className={`cp-hero__stat-card cp-hero__stat-card--${tone}`}
          >
            <span className="cp-hero__stat-card-label">{item.label}</span>
            <strong className="cp-hero__stat-card-value">
              {getCompanyHeroStatValue(company, item)}
            </strong>
          </article>
        );
      })}
    </div>
  );
}
