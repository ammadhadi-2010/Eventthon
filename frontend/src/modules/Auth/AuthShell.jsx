import React from 'react';
import EventThonLogo from '../../components/brand/EventThonLogo';
import './Login.css';

/**
 * Two-column auth layout: brand + image (left), form (right).
 * Mobile: stacked — brand on top, form scrollable below.
 */
const AuthShell = ({ brandTagline, children, cardClassName = '' }) => {
  return (
    <div className="login-page">
      <aside className="auth-brand" aria-hidden="true">
        <div className="auth-brand__overlay" />
        <div className="auth-brand__content">
          <p className="auth-brand__badge">The Verified Network</p>
          <EventThonLogo variant="authBrand" />
          <p className="auth-brand__tagline">{brandTagline}</p>
          <ul className="auth-brand__list">
            <li>Verified professional identity</li>
            <li>Collaborate, learn &amp; earn</li>
            <li>Secure access &amp; encrypted credentials</li>
          </ul>
        </div>
      </aside>

      <div className="auth-panel">
        <div className="auth-panel__inner">
          <div className={`glass-card ${cardClassName}`.trim()}>{children}</div>
        </div>
      </div>

      <footer className="auth-footer">© 2026 EventThon Global. All rights reserved.</footer>
    </div>
  );
};

export default AuthShell;
