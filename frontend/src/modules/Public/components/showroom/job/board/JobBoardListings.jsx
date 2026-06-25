import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import ShowroomStackTag from '../../ShowroomStackTag';

export default function JobBoardListings({ jobs, isGuest }) {
  const visible = jobs.slice(0, 12);

  return (
    <section className="ps-jb-listings ps-mp-grid__main" aria-label="Featured jobs">
      <h2>Featured Jobs</h2>
      {visible.map((job, index) => (
        <article key={job.entityId || job.publicSlug} className="ps-jb-job-card ps-jb-job-card--responsive">
          <div className="ps-jb-job-card__logo" style={{ background: job.companyColor || '#6366f1' }} aria-hidden>
            {job.companyName?.charAt(0) || 'E'}
          </div>
          <div className="ps-jb-job-card__body">
            <h3>
              <Link to={job.publicPath}>{job.title}</Link>
              {index < 3 ? <span className="ps-jb-featured">Featured</span> : null}
            </h3>
            <p className="ps-jb-job-card__company">
              {job.companyName || 'EventThon Partner'} · {job.postedAgo || 'Recently'}
            </p>
            <p className="ps-jb-job-card__location">{job.location || 'Fully Remote'}</p>
            <div className="ps-tag-row ps-jb-job-card__tags">
              {(job.skills || ['React', 'TypeScript']).slice(0, 4).map((tag) => (
                <ShowroomStackTag key={`${job.entityId}-${tag}`} label={tag} />
              ))}
            </div>
          </div>
          <div className="ps-jb-job-card__side">
            <div className="ps-jb-job-card__salary">
              <strong>{job.salary || '$120K - $160K'}</strong>
              <span>per year</span>
              <em>{job.employmentType || 'Full-time'}</em>
            </div>
            <div className="ps-jb-job-card__actions">
              {isGuest ? (
                <Link to="/auth/login" className="ps-btn ps-btn--primary">
                  Apply Now
                </Link>
              ) : (
                <Link to={job.publicPath} className="ps-btn ps-btn--primary">
                  Apply Now
                </Link>
              )}
              <button type="button" className="ps-jb-bookmark" aria-label="Save job">
                <Bookmark size={16} />
              </button>
            </div>
          </div>
        </article>
      ))}
      <button type="button" className="ps-jb-load-more">
        Load More Jobs
      </button>
    </section>
  );
}
