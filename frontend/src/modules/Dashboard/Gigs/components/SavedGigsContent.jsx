import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiClock, FiExternalLink, FiMapPin, FiTrash2 } from 'react-icons/fi';
import { recentGigs } from '../data/gigsData';
import useSavedGigs from '../hooks/useSavedGigs';
import { GigsHubSectionHeader } from './GigsHubBackButton';
import { isMongoObjectId } from '../utils/navigateGigSurfaces';

const SavedGigsContent = ({ onBack }) => {
  const navigate = useNavigate();
  const {
    savedRows: backendSavedRows,
    savedGigIdsLegacy,
    removeSaved,
    clearSaved,
    loading,
  } = useSavedGigs();

  const legacyRows = useMemo(
    () => recentGigs
      .filter((row) => savedGigIdsLegacy.includes(row.id))
      .map((row) => ({
        _id: `legacy-${row.id}`,
        gig_ref_id: `recent-${row.id}`,
        title: row.title,
        seller_name: row.seller,
        price_label: row.price,
        location_label: 'Remote',
        posted_label: row.eta || 'Saved recently',
        tags: row.tags || [],
      })),
    [savedGigIdsLegacy],
  );

  const mergedRows = useMemo(() => {
    const byRef = new Map();
    [...backendSavedRows, ...legacyRows].forEach((row) => {
      const key = String(row.gig_ref_id || row._id || '');
      if (!key || byRef.has(key)) return;
      byRef.set(key, row);
    });
    return Array.from(byRef.values());
  }, [backendSavedRows, legacyRows]);

  return (
    <section className="saved-gigs-card gigs-card">
      <div className="saved-gigs-head">
        <GigsHubSectionHeader
          title="Saved Gigs"
          subtitle="Jobs you've saved for later."
          onBack={onBack}
          className="saved-gigs-head__main"
        />
        <button type="button" className="saved-gigs-clear-btn" onClick={() => clearSaved()} disabled={!mergedRows.length}>
          Clear All
        </button>
      </div>

      {loading ? (
        <div className="saved-gigs-empty">
          <h3>Loading saved gigs...</h3>
        </div>
      ) : !mergedRows.length ? (
        <div className="saved-gigs-empty">
          <h3>No saved gigs yet</h3>
          <p>Browse gigs and tap the heart icon to save them here.</p>
        </div>
      ) : (
        <div className="saved-gigs-list">
          {mergedRows.map((gig, idx) => (
            <article key={gig._id || gig.gig_ref_id || idx} className="saved-gigs-row">
              <div className={`saved-gigs-logo ${idx % 2 ? 'purple' : 'blue'}`}>{String(gig.seller_name || 'S').charAt(0)}</div>
              <div>
                <h4>{gig.title}</h4>
                <p className="saved-gigs-seller">{gig.seller_name || 'Seller'}</p>
                <p className="saved-gigs-meta">
                  <span><FiMapPin size={12} /> {gig.location_label || 'Remote'}</span>
                  <span><FiClock size={12} /> {gig.posted_label || 'Saved recently'}</span>
                </p>
                <div className="gigs-recent-tags">
                  {(gig.tags || []).slice(0, 3).map((tag) => <span key={`${gig._id}-${tag}`}>{tag}</span>)}
                </div>
              </div>
              <div className="saved-gigs-actions">
                <strong>{gig.price_label || '--'}</strong>
                <button
                  type="button"
                  onClick={() => {
                    const gid = String(gig.gig_ref_id || '').trim();
                    if (isMongoObjectId(gid)) navigate(`/gigs/explorer?gig=${encodeURIComponent(gid)}`);
                  }}
                  disabled={!isMongoObjectId(String(gig.gig_ref_id || '').trim())}
                  title={isMongoObjectId(String(gig.gig_ref_id || '').trim()) ? 'Open in explorer' : 'Demo save — marketplace id missing'}
                >
                  <FiExternalLink size={13} />
                  Open
                </button>
                <button type="button" onClick={() => removeSaved(gig._id)}>
                  <FiTrash2 size={13} />
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default SavedGigsContent;
