import React from 'react';
import { formatAlertMeta } from '../data/jobAlertsData';
import JobAlertToggle from './JobAlertToggle';

export default function JobAlertRow({ alert, onToggleEmail }) {
  return (
    <article className="gigs-card ja-alert-row jh-mobile-data-card">
      <span className={`ja-alert-row__avatar ja-alert-row__avatar--${alert.logoClass}`}>
        {alert.logoText}
      </span>
      <div className="ja-alert-row__body">
        <h3>{alert.title}</h3>
        <p>{formatAlertMeta(alert)}</p>
      </div>
      <JobAlertToggle
        enabled={alert.emailEnabled}
        onChange={(next) => onToggleEmail?.(alert.id, next)}
      />
    </article>
  );
}
