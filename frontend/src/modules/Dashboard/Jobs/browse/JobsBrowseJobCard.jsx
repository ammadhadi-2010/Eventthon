import React, { useState } from 'react';
import { FiMapPin } from 'react-icons/fi';
import JobBookmarkButton from '../components/JobBookmarkButton';

function CompanyLogo({ job }) {
  const [broken, setBroken] = useState(false);
  const imageurl = String(job.imageurl || '').trim();
  const showImage = Boolean(imageurl) && !broken;

  if (showImage) {
    return (
      <img
        className="gigs-company-logo gigs-company-logo--image"
        src={imageurl}
        alt=""
        onError={() => setBroken(true)}
      />
    );
  }

  return <div className={`gigs-company-logo ${job.logoClass}`}>{job.logoText}</div>;
}

export default function JobsBrowseJobCard({ job, saved, onToggleSave, onApply, onSelect, isSelected }) {
  const openDetails = () => onSelect?.(job);

  return (
    <article
      className={`gigs-job-row gigs-job-row--premium gigs-job-row--clickable jobs-job-card${isSelected ? ' is-detail-open' : ''}`}
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
      <CompanyLogo job={job} />
      <div className="gigs-job-main">
        <h4>{job.role}</h4>
        <p className="gigs-job-company">{job.company}</p>
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
            Apply Now
          </button>
          <span onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
            <JobBookmarkButton job={job} saved={saved} onToggle={onToggleSave} />
          </span>
        </div>
      </div>
    </article>
  );
}
