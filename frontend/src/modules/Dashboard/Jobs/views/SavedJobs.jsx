import React from 'react';
import { FiMapPin } from 'react-icons/fi';
import JobBookmarkButton from '../components/JobBookmarkButton';
import JobsHubHeader from '../components/JobsHubHeader';
import JobsMobileSubViewShell from '../components/JobsMobileSubViewShell';
import { useJobsHub } from '../context/JobsHubContext';

export default function SavedJobs() {
  const { savedJobs, loading, toggleSavedJob, savedJobIds } = useJobsHub();

  return (
    <JobsMobileSubViewShell title="Saved Jobs">
      <section className="jh-view">
        <JobsHubHeader
          title="Saved Jobs"
          subtitle="Review your bookmarked jobs and shortlist picks."
        />
        <div className="jh-saved-list jh-mobile-card-list">
        {loading ? (
          <div className="gigs-card jh-empty-card">
            <p>Loading saved jobs…</p>
          </div>
        ) : savedJobs.length ? (
          savedJobs.map((job) => (
            <article key={job.saveId || job.id} className="gigs-job-row jh-saved-row jh-mobile-data-card">
              <div className={`gigs-company-logo ${job.logoClass}`}>{job.logoText}</div>
              <div className="gigs-job-main">
                <h4>{job.role}</h4>
                <p className="gigs-job-company">{job.company}</p>
                <div className="gigs-job-tags">
                  {(job.tags || []).map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </div>
              <div className="gigs-job-meta jh-mobile-data-card__meta">
                <p className="gigs-job-salary">{job.salary}</p>
                <p className="gigs-job-type">{job.type}</p>
                <p className="gigs-job-location">
                  <FiMapPin size={12} aria-hidden />
                  {job.location}
                </p>
              </div>
              <div className="gigs-job-side jh-mobile-data-card__side">
                <span>Saved {job.savedOn}</span>
                <JobBookmarkButton
                  job={job}
                  saved={savedJobIds.has(job.id) || savedJobIds.has(job.jobId)}
                  onToggle={toggleSavedJob}
                />
              </div>
            </article>
          ))
        ) : (
          <div className="gigs-card jh-empty-card">
            <p>No saved jobs yet. Bookmark roles from Browse Jobs to build your shortlist.</p>
          </div>
        )}
        </div>
      </section>
    </JobsMobileSubViewShell>
  );
}
