import React from 'react';
import ResourcesSideNav from './ResourcesSideNav';
import CompanySideNav from './CompanySideNav';
import FooterCtaAside from './FooterCtaAside';
import '../styles/footer-pages.css';
import '../styles/footer-pages-mobile.css';

export default function FooterPageShell({ variant = 'resources', children }) {
  const leftNav = variant === 'company' ? <CompanySideNav /> : <ResourcesSideNav />;

  return (
    <div className="fp-page fp-page-shell" style={{ minHeight: 'var(--et-hub-scroll-height)' }}>
      <div className="fp-hub-row" style={{ maxHeight: 'var(--et-hub-scroll-height)', flex: 1, minHeight: 0 }}>
        <aside className="fp-layout__rail fp-layout__rail--left" aria-label="Section navigation">
          {leftNav}
        </aside>
        <div className="fp-layout__center">
          <div className="fp-content-stack">{children}</div>
        </div>
        <aside className="fp-layout__rail fp-layout__rail--right" aria-label="Quick actions">
          <FooterCtaAside variant={variant} />
        </aside>
      </div>
    </div>
  );
}
