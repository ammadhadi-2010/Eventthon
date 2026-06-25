import React from 'react';
import { FiChevronDown, FiStar, FiHeart } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { recentGigs } from '../data/gigsData';
import useSavedGigs from '../hooks/useSavedGigs';
import { loadBrowseFilters, saveBrowseFilters } from '../utils/gigsBrowseSession';

/** Recent Gigs list — explorer + save wiring isolated here. */
const GigsBrowseRecentSection = () => {
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

  return (
    <div className="gigs-card gigs-jobs-board">
      <div className="gigs-section-head">
        <h3>Recent Gigs</h3>
        <button type="button" onClick={() => navigate('/gigs/explorer', { state: marketState() })}>View All</button>
      </div>
      <div className="gigs-recent-list">
        {recentGigs.map((gig) => (
          <article
            key={gig.id}
            className="gigs-recent-row"
            role="button"
            tabIndex={0}
            onClick={() => openRow(gig)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') openRow(gig);
            }}
          >
            <div className={`gigs-recent-logo ${gig.logoClass}`}>{gig.logoText}</div>
            <div className="gigs-recent-main">
              <h4>{gig.title}</h4>
              <p className="gigs-recent-seller">{gig.seller} • {gig.sellerLevel}</p>
              <div className="gigs-recent-tags">
                {gig.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
            <div className="gigs-recent-side">
              <p className="gigs-recent-rating"><FiStar size={12} /> {gig.rating} <span>({gig.reviews})</span></p>
              <p className="gigs-recent-price"><span>From</span> {gig.price}</p>
              <p className="gigs-recent-eta">{gig.eta}</p>
            </div>
            <button
              type="button"
              className={`gigs-recent-fav${isSaved(gig.id) ? ' is-active' : ''}`}
              aria-label={`${isSaved(gig.id) ? 'Unsave' : 'Save'} ${gig.title}`}
              onClick={async (event) => {
                event.stopPropagation();
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
                } catch {}
              }}
            >
              <FiHeart size={15} />
            </button>
          </article>
        ))}
      </div>
      <div className="gigs-recent-action">
        <button type="button" onClick={() => navigate('/gigs/explorer', { state: marketState() })}>
          Explore More Gigs <FiChevronDown size={14} />
        </button>
      </div>
    </div>
  );
};

export default GigsBrowseRecentSection;
