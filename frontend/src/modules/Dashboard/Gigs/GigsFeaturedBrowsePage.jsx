import React, { useEffect, useState } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import API from '../../../api/axiosConfig';
import GigFeaturedCard from './components/GigFeaturedCard';
import './styles/GigsDashboard.css';
import { normalizeGig, unwrapGigArrays } from './gigExplorer/model';
import { loadBrowseFilters } from './utils/gigsBrowseSession';

const badgeFor = (g) => {
  const rev = Number(g.reviews || 0);
  const r = parseFloat(g.rating);
  if (!Number.isFinite(r) || String(g.rating).toLowerCase() === 'new') return 'NEW';
  if (rev >= 40 || r >= 4.85) return 'TOP RATED';
  if (rev >= 12) return 'POPULAR';
  return 'FEATURED';
};

const GigsFeaturedBrowsePage = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErrorText('');
      try {
        const res = await API.get('/api/gigs', {
          params: { status: 'Published', limit: 100, sort: 'reviews', skip: 0 },
        });
        if (cancelled) return;
        const norm = unwrapGigArrays(res).map(normalizeGig);
        setRows(norm);
      } catch {
        if (!cancelled) setErrorText('Could not load marketplace gigs. Try again later.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const openGig = (g) => {
    navigate(`/gigs/explorer?gig=${encodeURIComponent(g.id)}`, {
      state: { browseIntent: 'market', gigFilters: loadBrowseFilters() },
    });
  };

  return (
    <div className="gigs-page">
      <section className="gigs-card gigs-jobs-board">
        <div style={{ marginBottom: 14 }}>
          <button
            type="button"
            onClick={() => navigate('/gigs')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              border: 0,
              background: 'transparent',
              color: '#38bdf8',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 700,
              padding: 0,
              marginBottom: 10,
            }}
          >
            <FiArrowLeft size={14} /> Back to Gigs
          </button>
          <h3 style={{ margin: 0, fontSize: 26, color: '#eaf2ff' }}><span>Featured Gigs</span> — full marketplace</h3>
          <p style={{ margin: '8px 0 0', fontSize: 13, color: '#94a3b8', maxWidth: 560 }}>
            Same layout as the home “Featured” row. Shows up to 100 published gigs, ordered by reviews and activity.
          </p>
        </div>
        {loading ? <p style={{ padding: 16, color: '#94a3b8' }}>Loading gigs…</p> : null}
        {errorText ? <p style={{ padding: 16, color: '#fca5a5' }}>{errorText}</p> : null}
        {!loading && !errorText && !rows.length ? (
          <p style={{ padding: 16, color: '#94a3b8' }}>No published gigs yet. Sellers can create gigs from “Create Gig”.</p>
        ) : null}
        <div className="gigs-featured-grid">
          {rows.map((gig, idx) => (
            <GigFeaturedCard
              key={gig.id}
              index={idx}
              gig={{
                ...gig,
                badge: badgeFor(gig),
              }}
              onOpen={openGig}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default GigsFeaturedBrowsePage;
