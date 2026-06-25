import React, { useEffect, useState } from 'react';
import { FiX } from 'react-icons/fi';
import { fetchAdminJobDetail } from '../../../../services/adminJobService';
import { JOB_STATUS_CLASS } from './jobData';

export default function JobViewModal({ jobId, open, onClose, onApprove, onReject }) {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !jobId) {
      setJob(null);
      return;
    }
    let active = true;
    setLoading(true);
    fetchAdminJobDetail(jobId)
      .then((row) => {
        if (active) setJob(row);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [open, jobId]);

  if (!open) return null;

  const fields = job
    ? [
        ['Title', job.title],
        ['Company', job.company],
        ['Category', job.category],
        ['Location', job.location],
        ['Salary', job.salary],
        ['Employment type', job.employmentType],
        ['Experience', job.experienceLevel],
        ['Work mode', job.workMode],
        ['Visibility', job.visibility],
        ['Applicants', job.applicants],
        ['Posted', job.posted],
      ]
    : [];

  return (
    <div className="jm-modal-overlay" role="dialog" aria-modal="true" aria-label="Job details">
      <button type="button" className="jm-modal-overlay__backdrop" onClick={onClose} aria-label="Close" />
      <div className="jm-modal gigs-card">
        <header className="jm-modal__head">
          <div>
            <h2>{job?.title || 'Job details'}</h2>
            <p>{job?.company || '—'}</p>
          </div>
          <button type="button" className="jm-modal__close" onClick={onClose} aria-label="Close">
            <FiX size={18} />
          </button>
        </header>
        {loading ? <p className="jm-modal__loading">Loading job…</p> : null}
        {job ? (
          <>
            <span className={`um-status-chip ${JOB_STATUS_CLASS[job.status] || ''}`}>
              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
            </span>
            <dl className="jm-detail-grid">
              {fields.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value ?? '—'}</dd>
                </div>
              ))}
            </dl>
            {job.description ? (
              <section className="jm-detail-block">
                <h3>Description</h3>
                <p>{job.description}</p>
              </section>
            ) : null}
            {job.skillsTags?.length ? (
              <section className="jm-detail-block">
                <h3>Skills</h3>
                <div className="jm-tag-row">
                  {job.skillsTags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </section>
            ) : null}
            <footer className="jm-modal__foot">
              <button type="button" className="um-btn um-btn--ghost" onClick={onClose}>
                Close
              </button>
              <button
                type="button"
                className="um-btn jm-btn--reject"
                onClick={() => onReject?.(job.id)}
              >
                Reject
              </button>
              <button
                type="button"
                className="um-btn um-btn--primary"
                onClick={() => onApprove?.(job.id)}
              >
                Approve
              </button>
            </footer>
          </>
        ) : null}
      </div>
    </div>
  );
}
