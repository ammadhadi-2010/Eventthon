import React from 'react';

export default function GigExplorerMobileListTrigger({ onOpen }) {
  return (
    <button
      type="button"
      className="gigx-mobile-drawer-btn"
      aria-label="Open Gigs Menu"
      onClick={onOpen}
    >
      <svg className="gigx-mobile-drawer-btn__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
      </svg>
      Browse Gigs
    </button>
  );
}
