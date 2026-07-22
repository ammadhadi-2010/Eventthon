import React from 'react';
import { FiStar } from 'react-icons/fi';
import { getRecentGigShade } from '../utils/recentGigShades';

function formatPrice(price) {
  if (typeof price === 'number') return `$${price}`;
  return price || '$0';
}

export default function GigFeaturedCard({ gig, index = 0, onOpen, className = '' }) {
  const shade = getRecentGigShade(index);
  const seller = gig.seller || gig.sellerName || 'Seller';
  const sellerLevel = gig.sellerLevel || 'Seller';
  const avatar = gig.sellerAvatarInitial || seller.charAt(0);
  const badge = gig.badge || 'FEATURED';

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpen?.(gig);
    }
  };

  return (
    <article
      className={`gigs-feature-card gigs-feature-card--${shade}${className ? ` ${className}` : ''}`}
      role="button"
      tabIndex={0}
      onClick={() => onOpen?.(gig)}
      onKeyDown={handleKeyDown}
    >
      <div className={`gigs-feature-thumb gigs-feature-thumb--${shade}`}>
        <span>{badge}</span>
      </div>
      <div className="gigs-feature-seller">
        <div className={`gigs-feature-avatar gigs-recent-logo gigs-recent-logo--${shade}`}>{avatar}</div>
        <div>
          <p>{seller}</p>
          <span>{sellerLevel}</span>
        </div>
      </div>
      <h4>{gig.title}</h4>
      <p className="gigs-feature-rating">
        <FiStar size={12} /> {gig.rating} ({gig.reviews})
      </p>
      <div className="gigs-feature-price">
        <span>From</span>
        <strong>{formatPrice(gig.price)}</strong>
      </div>
    </article>
  );
}
