import React from 'react';
import { statusMeta } from '../utils/applicationStatus';
import JobCompanyLogo from './JobCompanyLogo';

export default function ApplicationMobileCard({ application, shade = 'electric', onOpen }) {
  const status = statusMeta(application.status);
  const location = application.location || application.workMode || '';
  const open = () => onOpen?.(application);

  return (
    <article
      className={`jh-app-mobile-card jh-mobile-only jh-job-row jh-job-row--${shade}`}
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
      <JobCompanyLogo
        imageurl={application.imageurl}
        company={application.company}
        logoText={application.logoText}
        logoClass={application.logoClass}
        listingKind={application.listingKind}
        shade={shade}
        className="jh-app-mobile-card__logo"
      />
      <div className="jh-app-mobile-card__copy">
        <h3 className="jh-app-mobile-card__title">{application.role}</h3>
        <p className="jh-app-mobile-card__meta">
          {application.company}
          {location ? ` · ${location}` : ''}
        </p>
      </div>
      <span className={`jh-app-row__badge jh-app-row__badge--${status.tone}`}>
        {status.label}
      </span>
    </article>
  );
}
