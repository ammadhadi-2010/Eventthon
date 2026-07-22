import React, { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import GigFeaturedCard from '../components/GigFeaturedCard';
import { featuredGigs } from '../data/gigsData';
import { loadBrowseFilters } from '../utils/gigsBrowseSession';

const AUTO_PLAY_MS = 3800;

/** Featured Gigs carousel — auto-play, rounded cards (matches Projects hub). */
export default function GigsBrowseFeaturedSection() {
  const navigate = useNavigate();
  const trackRef = useRef(null);
  const pausedRef = useRef(false);

  const loopGigs = useMemo(
    () => (featuredGigs.length > 1 ? [...featuredGigs, ...featuredGigs] : featuredGigs),
    [],
  );

  const openGigInExplorer = (gig) => {
    navigate('/gigs/explorer', {
      state: { preselectTitle: gig.title, gigFilters: loadBrowseFilters() },
    });
  };

  useEffect(() => {
    const el = trackRef.current;
    if (!el || featuredGigs.length <= 1) return undefined;

    const advance = () => {
      if (pausedRef.current) return;

      const card = el.querySelector('.gigs-feature-card');
      const step = (card?.offsetWidth || 280) + 12;
      const loopWidth = el.scrollWidth / 2;

      if (el.scrollLeft >= loopWidth - 4) {
        el.scrollTo({ left: 0, behavior: 'auto' });
        window.requestAnimationFrame(() => {
          el.scrollBy({ left: step, behavior: 'smooth' });
        });
        return;
      }

      el.scrollBy({ left: step, behavior: 'smooth' });
    };

    const timer = window.setInterval(advance, AUTO_PLAY_MS);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="gigs-card gigs-jobs-board">
      <div className="gigs-section-head gigs-mobile-section-head">
        <h3 className="gigs-mobile-section-title"><span>Featured Gigs</span></h3>
        <button type="button" onClick={() => navigate('/gigs/browse/featured')}>View All</button>
      </div>
      <div
        className="gigs-featured-carousel"
        onMouseEnter={() => { pausedRef.current = true; }}
        onMouseLeave={() => { pausedRef.current = false; }}
        onFocusCapture={() => { pausedRef.current = true; }}
        onBlurCapture={() => { pausedRef.current = false; }}
      >
        <div ref={trackRef} className="gigs-featured-track" aria-live="off">
          {loopGigs.map((gig, index) => (
            <GigFeaturedCard
              key={`${gig.id}-${index}`}
              gig={gig}
              index={index % featuredGigs.length}
              onOpen={openGigInExplorer}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
