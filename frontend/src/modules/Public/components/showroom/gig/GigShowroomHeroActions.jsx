import React, { useState } from 'react';
import { Heart, MoreHorizontal, Share2 } from 'lucide-react';
import useCopyPublicLink from '../../../hooks/useCopyPublicLink';

export default function GigShowroomHeroActions({ publicPath }) {
  const [saved, setSaved] = useState(false);
  const { copied, copyLink } = useCopyPublicLink();

  return (
    <div className="ps-gig-hero-actions" aria-label="Gig actions">
      <button
        type="button"
        className={`ps-gig-hero-actions__btn${saved ? ' is-active' : ''}`}
        onClick={() => setSaved((v) => !v)}
        aria-pressed={saved}
        aria-label={saved ? 'Remove from saved' : 'Save gig'}
      >
        <Heart size={16} fill={saved ? 'currentColor' : 'none'} />
      </button>
      <button
        type="button"
        className="ps-gig-hero-actions__btn"
        onClick={() => copyLink(publicPath)}
        aria-label="Share gig link"
      >
        <Share2 size={16} />
        {copied ? <span className="ps-gig-hero-actions__hint">Copied</span> : null}
      </button>
      <button type="button" className="ps-gig-hero-actions__btn" aria-label="More options">
        <MoreHorizontal size={16} />
      </button>
    </div>
  );
}
