import React from 'react';
import JobsMobileSubViewShell from '../components/JobsMobileSubViewShell';
import { useJobsHub } from '../context/JobsHubContext';

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
            recommendedJobs.map((job) => (
              <article key={job.id} className="jh-rec-row jh-mobile-data-card">
                <div className={`gigs-company-logo ${job.logoClass}`}>{job.logoText}</div>
                <div className="jh-rec-row__main">
                  <h3>{job.role}</h3>
                  <p>{job.company}</p>
                  <div className="jh-rec-row__tags">
                    {(job.tags || []).map((tag) => (
                      <span
                        key={tag}
                        className={job.tagMatches?.[tag] ? 'jh-rec-tag jh-rec-tag--match' : 'jh-rec-tag'}
                        title={job.tagMatches?.[tag] ? `${job.matchPercent}% skill match` : undefined}
                      >
                        {tag}
                        {job.tagMatches?.[tag] ? <em>{job.matchPercent}%</em> : null}
                      </span>
                    ))}
                  </div>
                </div>
                <strong className="jh-rec-row__salary">{job.salary}</strong>
                <span className="jh-rec-row__match">{job.matchLabel}</span>
              </article>
            ))
          ) : (
            <p className="jh-rec-empty">Add skills to your profile to unlock personalized recommendations.</p>
          )}
        </div>
        </div>
      </section>
    </JobsMobileSubViewShell>
  );
}
