import React, { useCallback, useEffect, useState } from 'react';
import { FiBookmark, FiStar, FiTrash2 } from 'react-icons/fi';
import { resolvePortalImageurl } from '../utils/portalImage';
import CompanyBreadcrumb, { companyHubCrumbs } from '../components/CompanyBreadcrumb';
import {
  fetchCompanySavedCandidates,
  unsaveCompanyCandidate,
} from '../services/companyPortalApi';
import '../styles/company-jobs-pages.css';
import '../styles/company-recent-apps.css';

const TONES = ['mint', 'aurora', 'cobalt', 'solar', 'plasma', 'coral'];

export default function CompanySavedCandidatesPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchCompanySavedCandidates();
      setList(Array.isArray(data.candidates) ? data.candidates : []);
    } catch (err) {
      setList([]);
      setError(err?.response?.data?.detail || err?.message || 'Could not load saved candidates.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRemove = async (candidateUserId) => {
    setBusyId(candidateUserId);
    try {
      await unsaveCompanyCandidate(candidateUserId);
      await load();
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Could not remove candidate.');
    } finally {
      setBusyId('');
    }
  };

  return (
    <div className="cp-hub-page">
      <CompanyBreadcrumb items={companyHubCrumbs('Saved Candidates')} />
      <section className="cp-section cp-glass cp-hub-page__panel">
        <header className="cp-hub-page__intro">
          <div>
            <h1>Saved Candidates</h1>
            <p>Talent you bookmarked for future roles and outreach.</p>
          </div>
          <span className="cp-hub-page__count">{list.length} saved</span>
        </header>

        {error ? <p className="cp-hub-page__error">{error}</p> : null}

        <ul className="cp-apps-list">
          {loading ? <li className="cp-empty">Loading saved candidates…</li> : null}
          {!loading && !list.length ? (
            <li className="cp-empty">No saved candidates yet. Bookmark talent from applications or messages.</li>
          ) : null}
          {!loading
            ? list.map((row, index) => {
              const tone = TONES[index % TONES.length];
              return (
                <li key={row.id} className={`cp-apps-list__row cp-apps-list__row--${tone} cp-saved-row`}>
                  <img
                    className="cp-apps-list__avatar"
                    src={resolvePortalImageurl(row.imageurl, row.name)}
                    alt=""
                  />
                  <div className="cp-apps-list__main">
                    <strong>{row.name}</strong>
                    <span>{row.role}</span>
                    <em>{row.skills}</em>
                    {row.note ? <em className="cp-saved-row__note">{row.note}</em> : null}
                  </div>
                  <div className="cp-saved-row__side">
                    <span className="cp-saved-row__match">
                      <FiStar size={12} aria-hidden />
                      {row.match || 0}% match
                    </span>
                    <em className="cp-apps-list__time">Saved {row.saved}</em>
                    <span className="cp-saved-row__badge">
                      <FiBookmark size={12} aria-hidden />
                      Saved
                    </span>
                    <button
                      type="button"
                      className="cp-hub-page__ghost-btn"
                      disabled={busyId === row.candidateUserId}
                      onClick={() => onRemove(row.candidateUserId)}
                      aria-label="Remove saved candidate"
                    >
                      <FiTrash2 size={13} />
                    </button>
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
