import React from 'react';
import { FiChevronRight } from 'react-icons/fi';
import JobCompanyLogo from './JobCompanyLogo';
import { getJobCardShade } from '../utils/jobCardShades';

export default function CompanyRow({ company, index, onOpen }) {
  const shade = getJobCardShade(index);
  const jobsLabel = company.jobsLabel || `${company.jobsCount || 0} Jobs`;

  return (
    <li className="jh-companies-row-wrap">
      <button
        type="button"
        className={`jh-companies-row jh-mobile-data-card jh-job-row jh-job-row--${shade}`}
        onClick={() => onOpen?.(company)}
        aria-label={`View ${jobsLabel} at ${company.name}`}
      >
        <JobCompanyLogo
          imageurl={company.imageurl}
          company={company.name}
          logoText={company.logoText}
          logoClass={company.logoClass}
          shade={shade}
        />
        <div className="jh-companies-row__main">
          <h3>{company.name}</h3>
          <p>{company.industry || 'Hiring'}</p>
        </div>
        <span className="jh-companies-row__jobs">{jobsLabel}</span>
        <span className="jh-companies-row__cta" aria-hidden>
          <span className="jh-companies-row__cta-text">View</span>
          <FiChevronRight size={16} />
        </span>
      </button>
    </li>
  );
}
