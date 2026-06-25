import React from 'react';
import '../styles/gigs-hub-back-btn.css';

export function GigsHubBackButton({ onBack }) {
  const handleClick = () => {
    if (typeof onBack === 'function') onBack();
    else if (typeof window !== 'undefined') window.history.back();
  };

  return (
    <button type="button" className="ghub-back-btn" aria-label="Back" onClick={handleClick}>
      <svg className="ghub-back-btn__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
    </button>
  );
}

export function GigsHubSectionHeader({
  title,
  subtitle,
  onBack,
  as: Heading = 'h2',
  actions = null,
  className = '',
}) {
  const rootClass = ['ghub-section-head', className].filter(Boolean).join(' ');

  return (
    <div className={rootClass}>
      <GigsHubBackButton onBack={onBack} />
      <div className="ghub-section-head__copy">
        <Heading className="ghub-section-head__title">{title}</Heading>
        {subtitle ? <p className="ghub-section-head__sub">{subtitle}</p> : null}
      </div>
      {actions ? <div className="ghub-section-head__actions">{actions}</div> : null}
    </div>
  );
}
