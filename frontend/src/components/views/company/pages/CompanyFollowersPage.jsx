import React, { useCallback, useEffect, useState } from 'react';
import { FiHeart, FiMapPin, FiRefreshCw, FiTrash2, FiUser } from 'react-icons/fi';
import { resolvePortalImageurl } from '../utils/portalImage';
import CompanyBreadcrumb, { companyHubCrumbs } from '../components/CompanyBreadcrumb';
import { fetchCompanyFollowers, removeCompanyFollower } from '../services/companyPortalApi';
import '../styles/company-jobs-pages.css';
import '../styles/company-recent-apps.css';

const TONES = ['mint', 'aurora', 'cobalt', 'solar', 'plasma', 'coral'];

export default function CompanyFollowersPage() {
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchCompanyFollowers({ q: query, limit: 100 });
      setList(Array.isArray(data.followers) ? data.followers : []);
      setTotal(Number(data.total || 0));
    } catch (err) {
      setList([]);
      setTotal(0);
      setError(err?.response?.data?.detail || err?.message || 'Could not load followers.');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    load();
  }, [load]);

  const onRemove = async (followerUserId) => {
    if (!window.confirm('Remove this follower from your company page?')) return;
    setBusyId(followerUserId);
    setError('');
    try {
      await removeCompanyFollower(followerUserId);
      await load();
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Could not remove follower.');
    } finally {
      setBusyId('');
    }
  };

  return (
    <div className="cp-hub-page">
      <CompanyBreadcrumb items={companyHubCrumbs('Followers')} />
      <section className="cp-section cp-glass cp-hub-page__panel">
        <header className="cp-hub-page__intro">
          <div>
            <h1>Followers</h1>
            <p>People who follow your company for job updates and brand news.</p>
          </div>
          <div className="cp-hub-page__intro-actions">
            <button type="button" className="cp-hub-page__ghost-btn" onClick={load} aria-label="Refresh">
              <FiRefreshCw size={14} />
            </button>
            <span className="cp-hub-page__count">{total} followers</span>
          </div>
        </header>

        <form
          className="cp-followers-search"
          onSubmit={(e) => {
            e.preventDefault();
            setQuery(q.trim());
          }}
        >
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search followers by name or role…"
            aria-label="Search followers"
          />
          <button type="submit" className="cp-hub-page__primary-btn">Search</button>
        </form>

        {error ? <p className="cp-hub-page__error">{error}</p> : null}

        <ul className="cp-apps-list">
          {loading ? <li className="cp-empty">Loading followers…</li> : null}
          {!loading && !list.length ? (
            <li className="cp-empty">
              No followers yet. When members follow your company, they will show up here.
            </li>
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
                    <span>
                      <FiUser size={11} aria-hidden /> {row.role}
                    </span>
                    {row.location ? (
                      <em>
                        <FiMapPin size={11} aria-hidden /> {row.location}
                      </em>
                    ) : null}
                  </div>
                  <div className="cp-saved-row__side">
                    <span className="cp-saved-row__badge">
                      <FiHeart size={12} aria-hidden />
                      Follower
                    </span>
                    <em className="cp-apps-list__time">Joined {row.followedAt}</em>
                    <button
                      type="button"
                      className="cp-hub-page__ghost-btn"
                      disabled={busyId === row.followerUserId}
                      onClick={() => onRemove(row.followerUserId)}
                      aria-label={`Remove ${row.name}`}
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
