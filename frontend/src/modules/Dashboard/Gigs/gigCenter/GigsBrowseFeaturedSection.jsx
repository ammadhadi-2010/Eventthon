import React from 'react';
import { FiStar } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { featuredGigs } from '../data/gigsData';
import { loadBrowseFilters } from '../utils/gigsBrowseSession';

/** Featured Gigs grid — all explorer / featured-route navigation lives here. */
const GigsBrowseFeaturedSection = () => {
  const navigate = useNavigate();

  const openGigInExplorer = (title) => {
    navigate('/gigs/explorer', {
      state: { preselectTitle: title, gigFilters: loadBrowseFilters() },
    });
  };

  return (
    <div className="gigs-card gigs-jobs-board">
      <div className="gigs-section-head gigs-mobile-section-head">
        <h3 className="gigs-mobile-section-title"><span>Featured Gigs</span></h3>
        <button type="button" onClick={() => navigate('/gigs/browse/featured')}>View All</button>
      </div>
      <div className="gigs-featured-grid gigs-mobile-swipe-lane gigs-mobile-swipe-lane--featured">
        {featuredGigs.map((gig) => (
          <article
            key={gig.id}
            className="gigs-feature-card gigs-mobile-swipe-lane__item"
            role="button"
            tabIndex={0}
            onClick={() => openGigInExplorer(gig.title)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') openGigInExplorer(gig.title);
            }}
          >
            <div className={`gigs-feature-thumb ${gig.thumbClass}`}>
              <span>{gig.badge}</span>
            </div>
            <div className="gigs-feature-seller">
              <div className="gigs-feature-avatar">{gig.seller.charAt(0)}</div>
              <div>
                <p>{gig.seller}</p>
                <span>{gig.sellerLevel}</span>
              </div>
            </div>
            <h4>{gig.title}</h4>
            <p className="gigs-feature-rating"><FiStar size={12} /> {gig.rating} ({gig.reviews})</p>
            <div className="gigs-feature-price">
              <span>From</span>
              <strong>{gig.price}</strong>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default GigsBrowseFeaturedSection;
