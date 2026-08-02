import React from 'react';
import { Link } from 'react-router-dom';

export default function GigsHeroMobileActionBar({ onCreateGig }) {
  return (
    <div className="gigs-hero-mobile-actions">
      <Link to="/gigs/showrooms" className="gigs-hero-mobile-actions__btn gigs-hero-mobile-actions__btn--showroom">
        Public Showroom
      </Link>
      <button
        type="button"
        className="gigs-hero-mobile-actions__btn gigs-hero-mobile-actions__btn--create"
        onClick={() => onCreateGig?.()}
      >
        Create Gig
      </button>
    </div>
  );
}
