import React from 'react';
import { FiHeart, FiStar } from 'react-icons/fi';

export default function GigsRecentMobileCard({ gig, saved, onOpen, onToggleSave }) {
  return (
    <article
      className="gigs-recent-m-card"
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onOpen();
      }}
    >
      <div className="gigs-recent-m-avatar" aria-hidden="true">
        {gig.logoText}
      </div>
      <h4 className="gigs-recent-m-title">{gig.title}</h4>
      <span className="gigs-recent-m-level">{gig.sellerLevel}</span>
      {(gig.tags || []).length > 0 ? (
        <div className="gigs-recent-m-tags">
          {(gig.tags || []).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      ) : null}
      <div className="gigs-recent-m-foot">
        <span className="gigs-recent-m-rating">
          <FiStar size={11} aria-hidden /> {gig.rating} ({gig.reviews})
        </span>
        <span className="gigs-recent-m-price">
          From {gig.price}
        </span>
      </div>
      <button
        type="button"
        className={`gigs-recent-m-fav${saved ? ' is-active' : ''}`}
        aria-label="Toggle save"
        onClick={(event) => {
          event.stopPropagation();
          onToggleSave();
        }}
      >
        <FiHeart size={14} />
      </button>
    </article>
  );
}
