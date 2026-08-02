import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBriefcase, FiPlus, FiRefreshCw } from 'react-icons/fi';
import CompanyBreadcrumb, { companyHubCrumbs } from '../components/CompanyBreadcrumb';
import { fetchCompanyJobs, setCompanyJobStatus } from '../services/companyPortalApi';
import '../styles/company-jobs-pages.css';
import '../styles/company-recent-jobs.css';

const TONES = ['mint', 'aurora', 'cobalt', 'solar', 'coral', 'plasma'];
const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Live' },
  { id: 'pending', label: 'Pending' },
  { id: 'draft', label: 'Draft' },
  { id: 'closed', label: 'Closed' },
];

export default function CompanyAllJobsPage() {
  const [filter, setFilter] = useState('all');
  const [jobs, setJobs] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchCompanyJobs({ status: filter === 'all' ? 'all' : filter, limit: 80 });
      setJobs(Array.isArray(data.jobs) ? data.jobs : []);
      setCounts(data.counts || {});
    } catch (err) {
      setJobs([]);
      setError(err?.response?.data?.detail || err?.message || 'Could not load jobs.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const filterCounts = useMemo(() => ({
    all: counts.all ?? jobs.length,
    active: counts.active || 0,
    pending: counts.pending || 0,
    draft: counts.draft || 0,
    closed: counts.closed || 0,
  }), [counts, jobs.length]);

  const onStatus = async (jobId, status) => {
    setBusyId(jobId);
    setError('');
    try {
      await setCompanyJobStatus(jobId, status);
      await load();
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Status update failed.');
    } finally {
      setBusyId('');
    }
  };

  return (
    <div className="cp-hub-page">
      <CompanyBreadcrumb items={companyHubCrumbs('All Jobs')} />
      <section className="cp-section cp-glass cp-hub-page__panel">
        <header className="cp-hub-page__intro">
          <div>
            <h1>All Jobs</h1>
            <p>Manage live, pending, draft, and closed company listings.</p>
          </div>
          <div className="cp-hub-page__intro-actions">
            <button type="button" className="cp-hub-page__ghost-btn" onClick={load} aria-label="Refresh">
              <FiRefreshCw size={14} />
            </button>
            <Link to="/company/dashboard/jobs/new" className="cp-hub-page__primary-btn">
              <FiPlus size={14} />
              Post a Job
            </Link>
            <span className="cp-hub-page__count">{filterCounts.all} jobs</span>
          </div>
        </header>

        <div className="cp-hub-page__filters" role="tablist" aria-label="Job filters">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={filter === item.id}
              className={`cp-hub-page__chip${filter === item.id ? ' is-active' : ''}`}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
              <em>{filterCounts[item.id] || 0}</em>
            </button>
          ))}
        </div>

        {error ? <p className="cp-hub-page__error">{error}</p> : null}

        <ul className="cp-jobs-list">
          {loading ? <li className="cp-empty">Loading jobs…</li> : null}
          {!loading && !jobs.length ? <li className="cp-empty">No jobs in this filter yet.</li> : null}
          {!loading
            ? jobs.map((job, index) => {
              const tone = TONES[index % TONES.length];
              return (
                <li key={job.id} className={`cp-jobs-list__row cp-jobs-list__row--${tone}`}>
                  <span className="cp-jobs-list__icon" aria-hidden>
                    <FiBriefcase size={18} />
                  </span>
                  <div className="cp-jobs-list__main">
                    <strong>{job.title}</strong>
                    <p className="cp-jobs-list__meta">
                      {job.employmentType} • {job.location} • {job.salaryRange}
                    </p>
                    <p className="cp-jobs-list__meta">
                      {job.applicants || 0} applicants • Updated {job.updated}
                    </p>
                  </div>
                  <div className="cp-draft-row__meta">
                    <span className={`cp-draft-row__status is-${job.status}`}>{job.statusLabel || job.status}</span>
                    <div className="cp-jobs-list__actions">
                      {job.status === 'draft' ? (
                        <button type="button" disabled={busyId === job.id} onClick={() => onStatus(job.id, 'submit')}>
                          Submit
                        </button>
                      ) : null}
                      {job.status === 'active' || job.status === 'pending' ? (
                        <button type="button" disabled={busyId === job.id} onClick={() => onStatus(job.id, 'close')}>
                          Close
                        </button>
                      ) : null}
                      {job.status === 'closed' ? (
                        <button type="button" disabled={busyId === job.id} onClick={() => onStatus(job.id, 'reopen')}>
                          Reopen
                        </button>
                      ) : null}
                      <Link to={`/company/dashboard/applications?job=${encodeURIComponent(job.id)}`}>Applicants</Link>
                    </div>
                  </div>
                </li>
              );
            })
            : null}
        </ul>
      </section>
    </div>
  );
}
