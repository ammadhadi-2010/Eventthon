import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { resolvePortalImageurl } from '../utils/portalImage';
import CompanyBreadcrumb, { companyHubCrumbs } from '../components/CompanyBreadcrumb';
import { APP_FILTERS } from '../data/companyAppsFilters';
import {
  fetchCompanyApplications,
  setCompanyApplicationStatus,
} from '../services/companyPortalApi';
import '../styles/company-jobs-pages.css';
import '../styles/company-recent-apps.css';

const TONES = ['mint', 'aurora', 'cobalt', 'solar', 'plasma', 'coral'];

const STATUS_TONE = {
  pending: 'new',
  reviewing: 'reviewed',
  shortlisted: 'shortlisted',
  interview: 'interview',
  rejected: 'rejected',
};

const NEXT_STATUS = {
  pending: 'reviewing',
  reviewing: 'interview',
  interview: 'shortlisted',
  shortlisted: 'hired',
};

export default function CompanyApplicationsPage() {
  const [searchParams] = useSearchParams();
  const jobFilter = searchParams.get('job') || '';
  const [filter, setFilter] = useState('all');
  const [rows, setRows] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchCompanyApplications({
        status: filter,
        jobId: jobFilter,
        limit: 100,
      });
      setRows(Array.isArray(data.applications) ? data.applications : []);
      setCounts(data.counts || {});
    } catch (err) {
      setRows([]);
      setError(err?.response?.data?.detail || err?.message || 'Could not load applications.');
    } finally {
      setLoading(false);
    }
  }, [filter, jobFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const chipCounts = useMemo(() => {
    const map = { all: counts.all ?? rows.length };
    APP_FILTERS.forEach((item) => {
      if (item.id === 'all') return;
      map[item.id] = counts[item.id] || 0;
    });
    return map;
  }, [counts, rows.length]);

  const onAdvance = async (row) => {
    const next = NEXT_STATUS[row.statusKey] || 'reviewing';
    setBusyId(row.id);
    try {
      await setCompanyApplicationStatus(row.id, next);
      await load();
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Could not update status.');
    } finally {
      setBusyId('');
    }
  };

  const onReject = async (row) => {
    setBusyId(row.id);
    try {
      await setCompanyApplicationStatus(row.id, 'rejected');
      await load();
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Could not reject application.');
    } finally {
      setBusyId('');
    }
  };

  return (
    <div className="cp-hub-page">
      <CompanyBreadcrumb items={companyHubCrumbs('Applications')} />
      <section className="cp-section cp-glass cp-hub-page__panel">
        <header className="cp-hub-page__intro">
          <div>
            <h1>Applications</h1>
            <p>Review candidates and move them through your hiring pipeline.</p>
          </div>
          <span className="cp-hub-page__count">{chipCounts.all || 0} total</span>
        </header>

        <div className="cp-hub-page__filters" role="tablist" aria-label="Application filters">
          {APP_FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={filter === item.id}
              className={`cp-hub-page__chip${filter === item.id ? ' is-active' : ''}`}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
              <em>{chipCounts[item.id] || 0}</em>
            </button>
          ))}
        </div>

        {error ? <p className="cp-hub-page__error">{error}</p> : null}

        <ul className="cp-apps-list">
          {loading ? <li className="cp-empty">Loading applications…</li> : null}
          {!loading && !rows.length ? (
            <li className="cp-empty">No applications in this filter.</li>
          ) : null}
          {!loading
            ? rows.map((row, index) => {
              const tone = TONES[index % TONES.length];
              const statusTone = STATUS_TONE[row.statusKey] || 'new';
              return (
                <li key={row.id} className={`cp-apps-list__row cp-apps-list__row--${tone}`}>
                  <img
                    className="cp-apps-list__avatar"
                    src={resolvePortalImageurl(row.imageurl, row.name)}
                    alt=""
                  />
                  <div className="cp-apps-list__main">
                    <strong>{row.name}</strong>
                    <span>{row.role}</span>
                    <em>Applied for: {row.appliedFor}</em>
                  </div>
                  <div className="cp-apps-list__side">
                    <em className="cp-apps-list__time">{row.time}</em>
                    <span className={`cp-apps-list__badge cp-apps-list__badge--${statusTone}`}>
                      {row.status}
                    </span>
                    {row.statusKey !== 'rejected' && row.statusKey !== 'shortlisted' ? (
                      <button
                        type="button"
                        className="cp-hub-page__ghost-btn"
                        disabled={busyId === row.id}
                        onClick={() => onAdvance(row)}
                      >
                        Advance
                      </button>
                    ) : null}
                    {row.statusKey !== 'rejected' ? (
                      <button
                        type="button"
                        className="cp-hub-page__ghost-btn"
                        disabled={busyId === row.id}
                        onClick={() => onReject(row)}
                      >
                        Reject
                      </button>
                    ) : null}
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
