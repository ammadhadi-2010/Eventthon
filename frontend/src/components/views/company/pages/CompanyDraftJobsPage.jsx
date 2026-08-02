import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBriefcase, FiClock, FiEdit3 } from 'react-icons/fi';
import CompanyBreadcrumb, { companyHubCrumbs } from '../components/CompanyBreadcrumb';
import { fetchCompanyJobs, setCompanyJobStatus } from '../services/companyPortalApi';
import '../styles/company-jobs-pages.css';
import '../styles/company-recent-jobs.css';

const TONES = ['mint', 'aurora', 'cobalt', 'solar', 'coral', 'plasma'];

export default function CompanyDraftJobsPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchCompanyJobs({ status: 'draft', limit: 80 });
      setList(Array.isArray(data.jobs) ? data.jobs : []);
    } catch (err) {
      setList([]);
      setError(err?.response?.data?.detail || err?.message || 'Could not load drafts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onSubmit = async (jobId) => {
    setBusyId(jobId);
    try {
      await setCompanyJobStatus(jobId, 'submit');
      await load();
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Submit failed.');
    } finally {
      setBusyId('');
    }
  };

  return (
    <div className="cp-hub-page">
      <CompanyBreadcrumb items={companyHubCrumbs('Draft Jobs')} />
      <section className="cp-section cp-glass cp-hub-page__panel">
        <header className="cp-hub-page__intro">
          <div>
            <h1>Draft Jobs</h1>
            <p>Finish and publish drafts when your hiring brief is ready.</p>
          </div>
          <div className="cp-hub-page__intro-actions">
            <Link to="/company/dashboard/jobs/new" className="cp-hub-page__primary-btn">New draft</Link>
            <span className="cp-hub-page__count">{list.length} drafts</span>
          </div>
        </header>

        {error ? <p className="cp-hub-page__error">{error}</p> : null}

        <ul className="cp-jobs-list">
          {loading ? <li className="cp-empty">Loading drafts…</li> : null}
          {!loading && !list.length ? (
            <li className="cp-empty">No drafts yet. Create a job and save as draft.</li>
          ) : null}
          {!loading
            ? list.map((job, index) => {
              const tone = TONES[index % TONES.length];
              return (
                <li key={job.id} className={`cp-jobs-list__row cp-jobs-list__row--${tone} cp-draft-row`}>
                  <span className="cp-jobs-list__icon" aria-hidden>
                    <FiEdit3 size={18} />
                  </span>
                  <div className="cp-jobs-list__main">
                    <strong>{job.title}</strong>
                    <p className="cp-jobs-list__meta">
                      {job.employmentType} • {job.location}
                    </p>
                    <div className="cp-draft-row__bar" aria-hidden>
                      <span style={{ width: `${job.progress || 0}%` }} />
                    </div>
                  </div>
                  <div className="cp-draft-row__meta">
                    <span className="cp-draft-row__status">{job.statusLabel || 'Draft'}</span>
                    <em>
                      <FiClock size={12} aria-hidden />
                      {job.updated}
                    </em>
                    <span className="cp-draft-row__pct">{job.progress || 0}%</span>
                    <button
                      type="button"
                      className="cp-hub-page__ghost-btn"
                      disabled={busyId === job.id}
                      onClick={() => onSubmit(job.id)}
                    >
                      Submit for review
                    </button>
                  </div>
                  <span className="cp-draft-row__badge" aria-hidden>
                    <FiBriefcase size={14} />
                    Draft
                  </span>
                </li>
              );
            })
            : null}
        </ul>
      </section>
    </div>
  );
}
