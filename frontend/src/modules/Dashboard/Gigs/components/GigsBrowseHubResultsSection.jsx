import React from 'react';
import { FiExternalLink } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import GigRecentCard from './GigRecentCard';
import GigsRecentMobileCard from './GigsRecentMobileCard';
import { recentGigs } from '../data/gigsData';
import useSavedGigs from '../hooks/useSavedGigs';
import { loadBrowseFilters, saveBrowseFilters } from '../utils/gigsBrowseSession';

const GigsBrowseHubResultsSection = ({
  hasSearched,
  searching,
  rows = [],
  total = 0,
  searchTerm = '',
}) => {
  const navigate = useNavigate();
  const { savedRows, savedGigIdsLegacy, toggleSaved } = useSavedGigs();
  const displayRows = hasSearched ? rows : recentGigs.map((g) => ({ ...g, isLive: false }));
  const title = hasSearched ? 'Search Results' : 'Recent Gigs';

  const isSaved = (gigId) =>
    savedGigIdsLegacy.includes(gigId) ||
    savedRows.some((row) => row.gig_ref_id === gigId || row.gig_ref_id === `recent-${gigId}`);

  const exploreAll = () => {
    const merged =
      saveBrowseFilters({
        ...loadBrowseFilters(),
        search: searchTerm.trim(),
        sort_label: 'Best Match',
      }) || loadBrowseFilters();
    navigate('/gigs/explorer', { state: { gigFilters: merged, browseIntent: 'market' } });
  };

  const openRow = (gig) => {
    if (gig.isLive) {
      navigate(`/gigs/explorer?gig=${encodeURIComponent(gig.id)}`, {
        state: { browseIntent: 'market', gigFilters: loadBrowseFilters() },
      });
      return;
    }
    navigate(`/gigs/explorer?gig=${encodeURIComponent(`seed-recent-${gig.id}`)}`, {
      state: { preselectTitle: gig.title, gigFilters: loadBrowseFilters() },
    });
  };

  const saveGig = async (gig) => {
    try {
      await toggleSaved({
        gig_ref_id: gig.isLive ? gig.id : `recent-${gig.id}`,
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
    <div className="gigs-card gigs-jobs-board gigs-hub-results">
      <div className="gigs-section-head gigs-mobile-section-head">
        <h3 className="gigs-mobile-section-title">{title}</h3>
        {hasSearched && total > 0 ? <span className="gigs-hub-results__count">{total} found</span> : null}
      </div>

      {searching ? <p className="gigs-hub-results__status">Searching marketplace…</p> : null}
      {!searching && hasSearched && displayRows.length === 0 ? (
        <p className="gigs-hub-results__status">No published gigs match your search yet.</p>
      ) : null}

      <div className="gigs-recent-list gigs-recent-list--desktop">
        {displayRows.map((gig, index) => (
          <GigRecentCard
            key={`${hasSearched ? 's' : 'r'}-${gig.id}`}
            gig={gig}
            index={index}
            saved={isSaved(gig.id)}
            onOpen={openRow}
            onToggleSave={saveGig}
          />
        ))}
      </div>

      <div className="gigs-recent-mobile-list gigs-recent-mobile-stack" aria-label="Gig listings">
        {displayRows.map((gig, index) => (
          <GigsRecentMobileCard
            key={`m-${hasSearched ? 's' : 'r'}-${gig.id}`}
            gig={gig}
            index={index}
            saved={isSaved(gig.id)}
            onOpen={() => openRow(gig)}
            onToggleSave={() => saveGig(gig)}
          />
        ))}
      </div>

      {hasSearched ? (
        <div className="gigs-hub-results__footer">
          <button type="button" className="gigs-hub-results__explore" onClick={exploreAll}>
            Explore All Results
            <FiExternalLink size={14} aria-hidden />
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default GigsBrowseHubResultsSection;
