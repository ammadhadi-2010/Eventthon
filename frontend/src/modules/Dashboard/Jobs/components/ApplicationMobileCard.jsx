import React from 'react';
import { statusMeta } from '../utils/applicationStatus';

export default function ApplicationMobileCard({ application, onOpen }) {
  const status = statusMeta(application.status);
  const location = application.location || application.workMode || '';
  const open = () => onOpen?.(application);

  return (
    <article
      className="jh-app-mobile-card jh-mobile-only"
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open();
        }
      }}
    >
      <div className="jh-app-mobile-card__top">
        <h3 className="jh-app-mobile-card__title">{application.role}</h3>
        <span className={`jh-app-row__badge jh-app-row__badge--${status.tone}`}>{status.label}</span>
      </div>
      <p className="jh-app-mobile-card__meta">
        {application.company}
        {location ? ` · ${location}` : ''}
      </p>
      <p className="jh-app-mobile-card__date">Applied on {application.appliedOn}</p>
    </article>
  );
}
