import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { leftMenu } from '../data/gigsData';

export default function GigsHeroMobileActionBar({
  activeSection,
  onSectionSelect,
  onCreateGig,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    setMenuOpen(false);
  }, [activeSection]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const close = (event) => {
      if (!rootRef.current?.contains(event.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);

  const pickSection = (section) => {
    onSectionSelect?.(section);
    setMenuOpen(false);
  };

  return (
    <div ref={rootRef} className="gigs-hero-mobile-actions">
      <button
        type="button"
        className="gigs-hero-mobile-actions__btn gigs-hero-mobile-actions__btn--menu"
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        onClick={() => setMenuOpen((open) => !open)}
      >
        Menu
      </button>
      <button
        type="button"
        className="gigs-hero-mobile-actions__btn gigs-hero-mobile-actions__btn--create"
        onClick={() => onCreateGig?.()}
      >
        Create Gig
      </button>
      <Link to="/gigs/showrooms" className="gigs-hero-mobile-actions__btn gigs-hero-mobile-actions__btn--showroom">
        Public Showroom
      </Link>
      {menuOpen ? (
        <div className="gigs-hero-mobile-actions__menu-panel" role="menu" aria-label="Gigs hub navigation">
          {leftMenu.map((item) => (
            <button
              key={item}
              type="button"
              role="menuitem"
              className={`gigs-hero-mobile-actions__menu-item${
                activeSection === item ? ' is-active' : ''
              }`}
              onClick={() => pickSection(item)}
            >
              {item}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
