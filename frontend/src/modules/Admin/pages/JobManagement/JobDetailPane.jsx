import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { fetchAdminJobDetail, fetchAdminJobApplications } from '../../../../services/adminJobService';
import { JOB_STATUS_CLASS, APP_STATUS_CLASS, resolveJobImageurl } from './jobData';

function DetailItem({ label, value }) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-white">{value ?? '—'}</dd>
    </div>
  );
}

export default function JobDetailPane({ jobId, seedRow, onClose, onEdit, onStatusChange }) {
  const [job, setJob] = useState(seedRow || null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!jobId) return undefined;
    if (seedRow) setJob(seedRow);

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [detail, appsRes] = await Promise.all([
          fetchAdminJobDetail(jobId),
          fetchAdminJobApplications().catch(() => ({ rows: [] })),
        ]);
        if (cancelled) return;
        if (detail) setJob(detail);
        const rows = Array.isArray(appsRes?.rows) ? appsRes.rows : [];
        setApplicants(rows.filter((row) => String(row.jobId) === String(jobId)));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [jobId, seedRow]);

  if (!job) {
    return (
      <div className="um-page text-white">
        <button type="button" className="jm-detail-back" onClick={onClose}>
          <ArrowLeft size={16} /> Back to Jobs
        </button>
        <p className="text-slate-400">{loading ? 'Loading job…' : 'Job not found.'}</p>
      </div>
    );
  }

  const statusLabel = job.status ? job.status.charAt(0).toUpperCase() + job.status.slice(1) : '—';

  return (
    <div className={`um-page jm-detail-page text-white${loading ? ' opacity-90' : ''}`}>
      <button type="button" className="jm-detail-back" onClick={onClose}>
        <ArrowLeft size={16} /> Back to Jobs
      </button>

      <section className="um-card jm-detail-card">
        <header className="jm-detail-head">
          <img src={resolveJobImageurl(job)} alt="" className="jm-detail-logo" />
          <div className="min-w-0 flex-1">
            <p className="jm-detail-eyebrow">Job drill-down</p>
            <h2 className="jm-detail-title">{job.title}</h2>
            <p className="text-sm text-slate-400">{job.company}</p>
          </div>
          <span className={`um-status-chip ${JOB_STATUS_CLASS[job.status] || ''}`}>{statusLabel}</span>
        </header>

        <dl className="jm-detail-grid">
          <DetailItem label="Category" value={job.category} />
          <DetailItem label="Location" value={job.location} />
          <DetailItem label="Budget / Salary" value={job.salary} />
          <DetailItem label="Applicants" value={String(job.applicants ?? applicants.length)} />
          <DetailItem label="Employment" value={job.employmentType} />
          <DetailItem label="Experience" value={job.experienceLevel} />
          <DetailItem label="Work mode" value={job.workMode} />
          <DetailItem label="Posted" value={job.posted} />
        </dl>

        {job.description ? (
          <section className="jm-detail-block">
            <h3>Job Description</h3>
            <p>{job.description}</p>
          </section>
        ) : null}

        {job.skillsTags?.length ? (
          <section className="jm-detail-block">
            <h3>Category & Skills</h3>
            <div className="jm-tag-row">
              <span className="jm-cat-pill">{job.category}</span>
              {job.skillsTags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </section>
        ) : null}

        <section className="jm-detail-block">
          <h3>Applicants ({applicants.length})</h3>
          {applicants.length === 0 ? (
            <p className="jm-widget-empty">No applications for this posting yet.</p>
          ) : (
            <ul className="jm-applicant-list">
              {applicants.map((app) => (
                <li key={app.id}>
                  <strong>{app.applicantName}</strong>
                  <span>{app.appliedDate}</span>
                  <span className={`um-status-chip ${APP_STATUS_CLASS[app.status] || ''}`}>
                    {app.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <footer className="jm-detail-actions">
          <button type="button" className="um-btn um-btn--ghost" onClick={() => onEdit?.(job)}>
            Edit Job
          </button>
          <button
            type="button"
            className="um-btn um-btn--primary"
            onClick={async () => {
              await onStatusChange?.(job, 'active');
              const detail = await fetchAdminJobDetail(jobId);
              if (detail) setJob(detail);
            }}
          >
            Mark Open
          </button>
          <button
            type="button"
            className="um-btn jm-btn--reject"
            onClick={async () => {
              await onStatusChange?.(job, 'expired');
              const detail = await fetchAdminJobDetail(jobId);
              if (detail) setJob(detail);
            }}
          >
            Mark Closed
          </button>
        </footer>
      </section>
    </div>
  );
}
