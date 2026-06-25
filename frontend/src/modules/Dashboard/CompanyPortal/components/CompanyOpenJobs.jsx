import React from 'react';
import { Link } from 'react-router-dom';

export default function CompanyOpenJobs({ jobs }) {
  const list = jobs || [];
  return (
    <section className="cp-section cp-glass">
      <div className="cp-section__head">
        <h2>Open Jobs</h2>
        <Link to="/company/dashboard/jobs" className="cp-link-arrow">
          View All Jobs →
        </Link>
      </div>
      <div className="cp-jobs-track">
        {list.length === 0 ? (
          <p className="cp-empty">No open positions linked to this company yet.</p>
        ) : (
          list.map((job) => (
            <article key={job.id} className="cp-job-card">
              <h3>{job.title}</h3>
              <div className="cp-job-tags">
                {(job.tags || []).map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <p className="cp-job-salary">{job.salaryRange}</p>
              <footer>
                <span>{job.applicants}</span> Applicants
              </footer>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
