import React from 'react';
import { FiChevronRight } from 'react-icons/fi';
import { statusMeta } from '../utils/applicationStatus';
import JobCompanyLogo from './JobCompanyLogo';

export default function ApplicationRow({ application, shade = 'electric', onOpen }) {
  const status = statusMeta(application.status);

  return (
    <article className={`jh-app-row gigs-card jh-desktop-only jh-job-row jh-job-row--${shade}`}>
      <JobCompanyLogo
        imageurl={application.imageurl}
        company={application.company}
        logoText={application.logoText}
        logoClass={application.logoClass}
        listingKind={application.listingKind}
        shade={shade}
      />
      <div className="jh-app-row__main">
        <h3>{application.role}</h3>
        <p>{application.company}</p>
      </div>
      <p className="jh-app-row__date">Applied on {application.appliedOn}</p>
      <span className={`jh-app-row__badge jh-app-row__badge--${status.tone}`}>{status.label}</span>
      <button
        type="button"
        className="jh-app-row__chevron"
        aria-label={`View ${application.role} application`}
        onClick={() => onOpen?.(application)}
      >
        <FiChevronRight size={16} />
      </button>
    </article>
  );
}
