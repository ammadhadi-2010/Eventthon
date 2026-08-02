import React from 'react';
import { Link } from 'react-router-dom';
import { FiBriefcase, FiCode, FiDatabase, FiLayers, FiServer } from 'react-icons/fi';

const JOB_TONES = ['mint', 'aurora', 'cobalt', 'solar', 'coral'];
const JOB_ICONS = [FiCode, FiServer, FiLayers, FiBriefcase, FiDatabase];

function jobTone(index) {
  return JOB_TONES[index % JOB_TONES.length];
}

function JobIcon({ index }) {
  const Icon = JOB_ICONS[index % JOB_ICONS.length];
  return <Icon size={20} strokeWidth={1.8} />;
}

export default function CompanyOpenJobs({ jobs }) {
  const list = jobs || [];

  return (
    <section className="cp-section cp-glass cp-recent-jobs">
      <div className="cp-section__head">
        <h2>Recent Jobs</h2>
        <Link to="/company/dashboard/jobs" className="cp-section__link">
          Manage all
        </Link>
      </div>
      {list.length === 0 ? (
        <p className="cp-empty">No open positions linked to this company yet.</p>
      ) : (
        <ul className="cp-jobs-list">
          {list.map((job, index) => {
            const tone = jobTone(index);
            const type = job.employmentType || (job.tags && job.tags[0]) || 'Full-time';
            const place = job.location || (job.tags && job.tags[1]) || '';
            return (
              <li key={job.id} className={`cp-jobs-list__row cp-jobs-list__row--${tone}`}>
                <span className="cp-jobs-list__icon" aria-hidden>
                  <JobIcon index={index} />
                </span>
                <div className="cp-jobs-list__main">
                  <strong>{job.title}</strong>
                  <p className="cp-jobs-list__meta">
                    {type}
                    {place ? ` • ${place}` : ''}
                  </p>
                </div>
                <Link
                  to={`/company/dashboard/applications?job=${encodeURIComponent(job.id)}`}
                  className="cp-jobs-list__apps"
                >
                  <strong>{job.applicants ?? 0}</strong>
                  <span>Applicants</span>
                </Link>
                <em className="cp-jobs-list__time">{job.posted || 'Recently'}</em>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
