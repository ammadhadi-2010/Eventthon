import React from 'react';
import { FiChevronRight } from 'react-icons/fi';
import { statusMeta } from '../utils/applicationStatus';

export default function ApplicationRow({ application, onOpen }) {
  const status = statusMeta(application.status);

  return (
    <article className="jh-app-row gigs-card jh-desktop-only">
      <div className={`gigs-company-logo ${application.logoClass}`}>{application.logoText}</div>
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
