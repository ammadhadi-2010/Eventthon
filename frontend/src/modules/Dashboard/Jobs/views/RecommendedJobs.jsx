import React from 'react';
import JobCompanyLogo from '../components/JobCompanyLogo';
import JobsMobileSubViewShell from '../components/JobsMobileSubViewShell';
import { useJobsHub } from '../context/JobsHubContext';
import { getJobCardShade } from '../utils/jobCardShades';

export default function RecommendedJobs() {
  const { recommendedJobs, loading } = useJobsHub();

  return (
    <JobsMobileSubViewShell title="Recommended">
      <section className="jh-view jh-view--recommended">
        <div className="gigs-card jh-rec-panel">
          <header className="jh-rec-panel__header">
            <h2>Recommended for You</h2>
            <p>Jobs ranked by skill overlap with your profile.</p>
          </header>
          <div className="jh-rec-panel__list jh-mobile-card-list">
            {loading ? (
              <p className="jh-rec-empty">Loading recommendations…</p>
            ) : recommendedJobs.length ? (
              recommendedJobs.map((job, index) => {
                const shade = getJobCardShade(index);
                return (
                  <article
                    key={job.id}
                    className={`jh-rec-row jh-mobile-data-card jh-job-row jh-job-row--${shade}`}
                  >
                    <JobCompanyLogo
                      imageurl={job.imageurl}
                      company={job.company}
                      logoText={job.logoText}
                      logoClass={job.logoClass}
                      listingKind={job.listingKind}
                      shade={shade}
                      className="jh-rec-row__logo"
                      size={44}
                    />
                    <div className="jh-rec-row__main">
                      <div className="jh-rec-row__head">
                        <div className="jh-rec-row__copy">
                          <h3>{job.role}</h3>
                          <p>{job.company}</p>
                        </div>
                        <div className="jh-rec-row__side">
                          <strong className="jh-rec-row__salary">{job.salary}</strong>
                          <span className="jh-rec-row__match">{job.matchLabel}</span>
                        </div>
                      </div>
                      <div className="jh-rec-row__tags">
                        {(job.tags || []).map((tag) => (
                          <span
                            key={tag}
                            className={
                              job.tagMatches?.[tag]
                                ? 'jh-rec-tag jh-rec-tag--match'
                                : 'jh-rec-tag'
                            }
                            title={
                              job.tagMatches?.[tag]
                                ? `${job.matchPercent}% skill match`
                                : undefined
                            }
                          >
                            {tag}
                            {job.tagMatches?.[tag] ? <em>{job.matchPercent}%</em> : null}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <p className="jh-rec-empty">
                Add skills to your profile to unlock personalized recommendations.
              </p>
            )}
          </div>
        </div>
      </section>
    </JobsMobileSubViewShell>
  );
}
