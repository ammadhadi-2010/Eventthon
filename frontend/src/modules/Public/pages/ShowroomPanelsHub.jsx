import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiExternalLink, FiEye } from 'react-icons/fi';
import { fetchShowroomPanelLinks } from '../services/publicApi';
import '../styles/showroom-premium.css';
import '../styles/showroom-panels-hub-mobile.css';

function resolveOwnerId() {
  return (
    localStorage.getItem('userMobile') ||
    localStorage.getItem('userEmail') ||
    ''
  );
}

export default function ShowroomPanelsHub({ filterType = null, title = 'Public Showroom Panels', onBack = null }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchShowroomPanelLinks(resolveOwnerId())
      .then((payload) => {
        if (!active) return;
        const all = payload?.items || [];
        setItems(filterType ? all.filter((row) => row.type === filterType) : all);
      })
      .catch(() => {
        if (!active) return;
        setError('Could not load showroom links from the server.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [filterType]);

  return (
    <div className="sph-page w-full max-w-full overflow-x-hidden">
      {onBack ? (
        <div className="flex flex-row items-center justify-start gap-3 w-full mb-2">
          <button
            type="button"
            className="flex items-center justify-center h-9 w-9 bg-slate-950/60 hover:bg-slate-900 border border-slate-800 rounded-full text-zinc-200 active:scale-95 transition-all shrink-0 cursor-pointer"
            aria-label="Go Back"
            onClick={onBack}
          >
            <svg className="h-4 w-4 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="sph-page__title m-0">{title}</h1>
        </div>
      ) : (
        <h1 className="sph-page__title">{title}</h1>
      )}
      <p className="sph-page__lead">
        Manage and preview SEO-friendly public links. Owner preview opens inside EventThon; Public URL opens the guest showroom.
      </p>
      {loading ? <p className="public-state">Loading showroom links...</p> : null}
      {error ? <p className="public-state public-state--error">{error}</p> : null}
      {!loading && !error && items.length === 0 ? (
        <p className="public-state">No public showrooms yet. Publish a project, gig, or job to appear here.</p>
      ) : null}
      <div className="sph-grid w-full">
        {items.map((row) => (
          <article
            key={`${row.type}-${row.entityId}`}
            className="sph-card flex flex-col lg:flex-row lg:items-center lg:justify-between w-full p-4 lg:p-5 bg-[#090d16] border border-slate-800 rounded-xl gap-4"
          >
            <div className="sph-card__copy w-full min-w-0 flex-1">
              <span className="sph-card__type">{row.type}</span>
              <strong>{row.title}</strong>
              <span className="sph-card__subtitle">{row.subtitle}</span>
            </div>
            <div className="sph-card__actions flex flex-row items-center w-full lg:w-auto gap-3 ml-0 lg:ml-auto shrink-0">
              <Link
                to={row.previewPath}
                className="ps-btn ps-btn--ghost flex-1 lg:flex-initial text-xs font-semibold px-4 py-2.5 rounded-lg text-center justify-center whitespace-nowrap inline-flex items-center gap-1.5"
                state={{ fromShowroomHub: true, entityType: row.type }}
              >
                <FiEye size={14} /> Owner Preview
              </Link>
              <a
                href={row.publicPath}
                className="ps-btn ps-btn--primary flex-1 lg:flex-initial text-xs font-semibold px-4 py-2.5 rounded-lg text-center justify-center whitespace-nowrap inline-flex items-center gap-1.5"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FiExternalLink size={14} /> Public URL
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
