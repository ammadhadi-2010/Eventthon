import React from 'react';
import { Link } from 'react-router-dom';
import { COMPANY_HUB_KPIS } from '../data/companyHeroStats';

const KPI_LINKS = {
  openJobs: '/company/dashboard/jobs',
  totalApplications: '/company/dashboard/applications',
  followers: '/company/dashboard/followers',
};

function RatingStars({ value }) {
  const n = Number(value);
  const filled = Number.isFinite(n) ? Math.max(0, Math.min(5, Math.round(n))) : 0;
  return (
    <span className="cp-kpi-card__stars" aria-label={`${value} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < filled ? 'is-on' : ''} aria-hidden>
          ★
        </span>
      ))}
    </span>
  );
}

export default function CompanyHeroStatsStrip({ company, analytics }) {
  if (!company) return null;

  return (
    <div className="cp-kpi-strip" aria-label="Company metrics">
      {COMPANY_HUB_KPIS.map((item) => {
        const Icon = item.Icon;
        const value = item.getValue(company);
        const delta = item.getDelta?.(analytics);
        const showDelta = delta && delta !== '—';
        const href = KPI_LINKS[item.key];
        const CardTag = href ? Link : 'article';
        const cardProps = href
          ? { to: href, className: `cp-kpi-card cp-kpi-card--${item.tone}` }
          : { className: `cp-kpi-card cp-kpi-card--${item.tone}` };

        return (
          <CardTag key={item.key} {...cardProps}>
            <div className="cp-kpi-card__body">
              <span className="cp-kpi-card__label">{item.label}</span>
              <strong className="cp-kpi-card__value">{value}</strong>
              {item.showStars ? (
                <RatingStars value={value} />
              ) : showDelta ? (
                <em className="cp-kpi-card__delta">
                  {delta}
                  {item.deltaSuffix ? ` ${item.deltaSuffix}` : ''}
                </em>
              ) : (
                <em className="cp-kpi-card__delta cp-kpi-card__delta--muted">From live data</em>
              )}
            </div>
            {Icon ? (
              <span className="cp-kpi-card__icon" aria-hidden>
                <Icon size={28} strokeWidth={1.6} />
              </span>
            ) : null}
          </CardTag>
        );
      })}
    </div>
  );
}
