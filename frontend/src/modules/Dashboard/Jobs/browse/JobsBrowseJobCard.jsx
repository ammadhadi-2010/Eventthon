import React from 'react';
import { FiMapPin } from 'react-icons/fi';
import JobBookmarkButton from '../components/JobBookmarkButton';
import JobCompanyLogo from '../components/JobCompanyLogo';
import { getJobCardShade } from '../utils/jobCardShades';

export default function JobsBrowseJobCard({
  job,
  index = 0,
  saved,
  onToggleSave,
  onApply,
  onSelect,
  isSelected,
}) {
  const shade = getJobCardShade(index);
  const openDetails = () => onSelect?.(job);

  return (
    <article
      className={`gigs-job-row gigs-job-row--premium gigs-job-row--clickable jobs-job-card jobs-job-card--${shade}${isSelected ? ' is-detail-open' : ''}`}
      onClick={openDetails}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openDetails();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${job.role} at ${job.company}`}
    >
      <JobCompanyLogo
        imageurl={job.imageurl}
        company={job.company}
        logoText={job.logoText}
        logoClass={job.logoClass}
        listingKind={job.listingKind}
        shade={shade}
      />
      <div className="gigs-job-main">
        <h4>{job.role}</h4>
        <p className="gigs-job-company">
          {job.company}
          {job.listingKind === 'opportunity' ? (
            <span className="jobs-job-kind-badge">Opportunity</span>
          ) : null}
        </p>
        <div className="gigs-job-tags">
          {(job.tags || []).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>
      <div className="gigs-job-meta">
        <p className="gigs-job-salary">{job.salary}</p>
        <p className="gigs-job-type">{job.type}</p>
        <p className="gigs-job-location">
          <FiMapPin size={12} aria-hidden />
          {job.location}
        </p>
      </div>
      <div className="gigs-job-side gigs-job-side--actions">
        <span className="jobs-job-card__posted">{job.posted}</span>
        <div className="gigs-job-side__btns">
          <button
            type="button"
            className="jh-apply-btn"
            onClick={(e) => {
              e.stopPropagation();
              onApply?.(job);
            }}
          >
            <span className="jh-apply-btn__text">
              {job.listingKind === 'opportunity' ? 'Join' : 'Apply Now'}
            </span>
          </button>
          <span onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
            <JobBookmarkButton job={job} saved={saved} onToggle={onToggleSave} />
          </span>
        </div>
      </div>
    </article>
  );
}
