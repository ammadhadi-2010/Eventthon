import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiStar } from 'react-icons/fi';
import { RECOMMENDED_GIGS } from '../../data/gigsRightSidebarData';

export default function GigsRecommendedSection() {
  const navigate = useNavigate();

  return (
    <div className="gigs-card gigs-right-list-card">
      <div className="gigs-right-section-head">
        <h3>Recommended for You</h3>
        <Link to="/gigs/browse/featured">View All</Link>
      </div>
      <div className="gigs-right-list">
        {RECOMMENDED_GIGS.map((gig) => (
          <article
            key={gig.id}
            className="gigs-right-list-row is-interactive"
            role="button"
            tabIndex={0}
            onClick={() => navigate(gig.path)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate(gig.path);
              }
            }}
          >
            <div className="gigs-right-list-avatar">{gig.seller.charAt(0)}</div>
            <div>
              <h4>{gig.title}</h4>
              <p>
                {gig.seller} • {gig.level}
              </p>
            </div>
            <div className="gigs-right-meta">
              <small>
                <FiStar size={11} /> {gig.rating}
              </small>
              <strong>From {gig.price}</strong>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
