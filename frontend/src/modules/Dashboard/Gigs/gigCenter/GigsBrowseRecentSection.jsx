import React from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import GigRecentCard from '../components/GigRecentCard';
import GigsRecentMobileCard from '../components/GigsRecentMobileCard';
import { recentGigs } from '../data/gigsData';
import useSavedGigs from '../hooks/useSavedGigs';
import { loadBrowseFilters, saveBrowseFilters } from '../utils/gigsBrowseSession';

/** Recent Gigs list — explorer + save wiring isolated here. */
export default function GigsBrowseRecentSection() {
  const navigate = useNavigate();
  const { savedRows, savedGigIdsLegacy, toggleSaved } = useSavedGigs();

  const isSaved = (gigId) => (
    savedGigIdsLegacy.includes(gigId) || savedRows.some((row) => row.gig_ref_id === `recent-${gigId}`)
  );

  const marketState = () => ({
    gigFilters:
      saveBrowseFilters({
        ...loadBrowseFilters(),
        sort_label: 'Newest First',
      }) || loadBrowseFilters(),
    browseIntent: 'market',
  });

  const openRow = (gig) => {
    navigate(`/gigs/explorer?gig=${encodeURIComponent(`seed-recent-${gig.id}`)}`, {
      state: { preselectTitle: gig.title, gigFilters: loadBrowseFilters() },
    });
  };

  const saveGig = async (gig) => {
    try {
      await toggleSaved({
        gig_ref_id: `recent-${gig.id}`,
        title: gig.title,
        seller_name: gig.seller,
        price_label: `${gig.price}`,
        location_label: 'Remote',
        posted_label: 'Saved now',
        tags: gig.tags || [],
      });
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="gigs-card gigs-jobs-board">
      <div className="gigs-section-head">
        <h3>Recent Gigs</h3>
        <button type="button" onClick={() => navigate('/gigs/explorer', { state: marketState() })}>View All</button>
      </div>
      <div className="gigs-recent-list gigs-recent-list--desktop">
        {recentGigs.map((gig, index) => (
          <GigRecentCard
            key={gig.id}
            gig={gig}
            index={index}
            saved={isSaved(gig.id)}
            onOpen={openRow}
            onToggleSave={saveGig}
          />
        ))}
      </div>
      <div className="gigs-recent-mobile-list gigs-recent-mobile-stack" aria-label="Recent gigs">
        {recentGigs.map((gig, index) => (
          <GigsRecentMobileCard
            key={`m-${gig.id}`}
            gig={gig}
            index={index}
            saved={isSaved(gig.id)}
            onOpen={() => openRow(gig)}
            onToggleSave={() => saveGig(gig)}
          />
        ))}
      </div>
      <div className="gigs-recent-action">
        <button type="button" onClick={() => navigate('/gigs/explorer', { state: marketState() })}>
          Explore More Gigs <FiChevronDown size={14} />
        </button>
      </div>
    </div>
  );
}
