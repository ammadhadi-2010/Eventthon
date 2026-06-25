import React, { useMemo, useState } from 'react';
import { FiBriefcase, FiClock, FiMapPin, FiX } from 'react-icons/fi';
import JobBookmarkButton from './JobBookmarkButton';
import { enrichJobDetails } from '../utils/jobDetailsCopy';
import { isJobsUserSignedIn } from '../utils/jobsUser';
import '../styles/jobs-job-details.css';

export default function JobDetailsDrawer({
  job,
  open,
  saved,
  onClose,
  onApply,
  onToggleSave,
  onApplyWithResume,
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const detail = useMemo(() => enrichJobDetails(job), [job]);

  if (!open || !detail) return null;

  const signedIn = isJobsUserSignedIn();

  const handleApply = async () => {
    if (!signedIn) {
      setMessage('Sign in with your mobile or email to apply.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const created = await onApply?.(detail);
      if (created) {
        setMessage('Application submitted successfully.');
      } else {
        setMessage('Application could not be submitted. Try again.');
      }
    } catch (err) {
      const detailMsg = err?.response?.data?.detail;
      setMessage(
        typeof detailMsg === 'string' ? detailMsg : 'You may have already applied to this job.',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="jh-job-detail-overlay" role="dialog" aria-modal="true" aria-label="Job details">
      <button type="button" className="jh-job-detail-overlay__backdrop" onClick={onClose} aria-label="Close" />
      <aside className="jh-job-detail-drawer gigs-card">
        <header className="jh-job-detail-drawer__head">
          <div className={`gigs-company-logo ${detail.logoClass}`}>{detail.logoText}</div>
          <div className="jh-job-detail-drawer__titles">
            <h2>{detail.role}</h2>
            <p>{detail.company}</p>
          </div>
          <button type="button" className="jh-job-detail-drawer__close" onClick={onClose} aria-label="Close">
            <FiX size={18} />
          </button>
        </header>

        <div className="jh-job-detail-meta">
          <span>
            <FiBriefcase size={12} aria-hidden />
            {detail.type}
          </span>
          <span>
            <FiMapPin size={12} aria-hidden />
            {detail.location}
          </span>
          <span>
            <FiClock size={12} aria-hidden />
            Posted {detail.posted}
          </span>
        </div>

        <p className="jh-job-detail-salary">{detail.salary}</p>

        <section className="jh-job-detail-section">
          <h3>About this role</h3>
          <p>{detail.description}</p>
        </section>

        <section className="jh-job-detail-section">
          <h3>Required skills</h3>
          <div className="jh-job-detail-tags">
            {(detail.tags || []).map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </section>

        <section className="jh-job-detail-section">
          <h3>Requirements</h3>
          <ul className="jh-job-detail-list">
            {(detail.requirements || []).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="jh-job-detail-section jh-job-detail-constraints">
          <h3>Role metadata</h3>
          <dl>
            <div>
              <dt>Category</dt>
              <dd>{detail.category || 'General'}</dd>
            </div>
            <div>
              <dt>Experience</dt>
              <dd>{detail.experienceLevel || 'Not specified'}</dd>
            </div>
            <div>
              <dt>Work mode</dt>
              <dd>{detail.workMode || detail.location}</dd>
            </div>
            <div>
              <dt>Salary band</dt>
              <dd>{detail.salary}</dd>
            </div>
          </dl>
        </section>

        {!signedIn ? (
          <p className="jh-job-detail-banner">Sign in to apply and track this role in My Applications.</p>
        ) : null}
        {message ? <p className="jh-job-detail-message">{message}</p> : null}

        <footer className="jh-job-detail-foot">
          <JobBookmarkButton job={detail} saved={saved} onToggle={onToggleSave} />
          <button type="button" className="ja-footer-cancel" onClick={() => onApplyWithResume?.(detail)}>
            Upload resume
          </button>
          <button type="button" className="jobs-alert-btn" onClick={handleApply} disabled={busy}>
            {busy ? 'Applying…' : 'Apply Now'}
          </button>
        </footer>
      </aside>
    </div>
  );
}
