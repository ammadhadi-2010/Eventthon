import React from 'react';
import { FiHeart, FiStar } from 'react-icons/fi';
import { getRecentGigShade } from '../utils/recentGigShades';

export default function GigRecentCard({ gig, index = 0, saved, onOpen, onToggleSave }) {
  const shade = getRecentGigShade(index);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpen?.(gig);
    }
  };

  return (
    <article
      className={`gigs-recent-row gigs-recent-row--${shade}`}
      role="button"
      tabIndex={0}
      onClick={() => onOpen?.(gig)}
      onKeyDown={handleKeyDown}
    >
      <div className={`gigs-recent-logo gigs-recent-logo--${shade}`}>{gig.logoText}</div>
      <div className="gigs-recent-main">
        <h4>{gig.title}</h4>
        <p className="gigs-recent-seller">
          {gig.seller} • {gig.sellerLevel}
        </p>
        <div className="gigs-recent-tags">
          {(gig.tags || []).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>
      <div className="gigs-recent-side">
        <p className="gigs-recent-rating">
          <FiStar size={12} /> {gig.rating} <span>({gig.reviews})</span>
        </p>
        <p className="gigs-recent-price">
          <span>From</span> {gig.price}
        </p>
        <p className="gigs-recent-eta">{gig.eta}</p>
      </div>
      <button
        type="button"
        className={`gigs-recent-fav${saved ? ' is-active' : ''}`}
        aria-label={`${saved ? 'Unsave' : 'Save'} ${gig.title}`}
        onClick={(event) => {
          event.stopPropagation();
          onToggleSave?.(gig);
        }}
      >
        <FiHeart size={15} />
      </button>
    </article>
  );
}
