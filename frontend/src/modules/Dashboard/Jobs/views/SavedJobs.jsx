import React from 'react';
import { FiMapPin } from 'react-icons/fi';
import JobBookmarkButton from '../components/JobBookmarkButton';
import JobCompanyLogo from '../components/JobCompanyLogo';
import JobsHubHeader from '../components/JobsHubHeader';
import JobsMobileSubViewShell from '../components/JobsMobileSubViewShell';
import { useJobsHub } from '../context/JobsHubContext';
import { getJobCardShade } from '../utils/jobCardShades';

export default function SavedJobs() {
  const { savedJobs, loading, toggleSavedJob, savedJobIds } = useJobsHub();

  return (
    <JobsMobileSubViewShell title="Saved">
      <section className="jh-view">
        <JobsHubHeader
          title="Saved"
          subtitle="Bookmarked jobs and opportunities in one shortlist."
        />
        <div className="jh-saved-list jh-mobile-card-list">
          {loading ? (
            <div className="gigs-card jh-empty-card">
              <p>Loading saved items…</p>
            </div>
          ) : savedJobs.length ? (
            savedJobs.map((job, index) => {
              const shade = getJobCardShade(index);
              const isOpportunity = job.listingKind === 'opportunity';
              return (
                <article
                  key={job.saveId || job.id}
                  className={`gigs-job-row jh-saved-row jh-mobile-data-card jh-job-row jh-job-row--${shade}`}
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
                      {isOpportunity ? (
                        <span className="jobs-job-kind-badge">Opportunity</span>
                      ) : null}
                    </p>
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
              );
            })
          ) : (
            <div className="gigs-card jh-empty-card">
              <p>
                Nothing saved yet. Bookmark a job or opportunity from Browse to build your
                shortlist.
              </p>
            </div>
          )}
        </div>
      </section>
    </JobsMobileSubViewShell>
  );
}
