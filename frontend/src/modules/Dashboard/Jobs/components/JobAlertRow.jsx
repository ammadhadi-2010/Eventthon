import React from 'react';
import { formatAlertMeta, normalizeAlertKind } from '../data/jobAlertsData';
import JobAlertToggle from './JobAlertToggle';
import JobCompanyLogo from './JobCompanyLogo';

export default function JobAlertRow({ alert, shade = 'electric', onToggleEmail }) {
  const kind = normalizeAlertKind(alert);
  const isOpportunity = kind === 'opportunity';

  return (
    <article className={`gigs-card ja-alert-row jh-mobile-data-card jh-job-row jh-job-row--${shade}`}>
      <JobCompanyLogo
        imageurl={alert.imageurl}
        company={alert.company}
        logoText={alert.logoText}
        logoClass={alert.logoClass}
        alertKind={kind}
        shade={shade}
        className="ja-alert-row__avatar"
      />
      <div className="ja-alert-row__body">
        <div className="ja-alert-row__title-row">
          <h3>{alert.title}</h3>
          <span className={`ja-alert-kind-badge ja-alert-kind-badge--${kind}`}>
            {isOpportunity ? 'Opportunity' : 'Job'}
          </span>
        </div>
        <p>{formatAlertMeta(alert)}</p>
      </div>
      <JobAlertToggle
        enabled={alert.emailEnabled}
        onChange={(next) => onToggleEmail?.(alert.id, next)}
      />
    </article>
  );
}
