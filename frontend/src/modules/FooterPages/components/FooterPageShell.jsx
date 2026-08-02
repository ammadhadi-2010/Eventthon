import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { subscribeHubDrawerToggle } from '../../Dashboard/Navbar/hubDrawerBus';
import ResourcesSideNav from './ResourcesSideNav';
import CompanySideNav from './CompanySideNav';
import FooterCtaAside from './FooterCtaAside';
import FooterBreadcrumb from './FooterBreadcrumb';
import { buildFooterCrumbs } from '../utils/footerBreadcrumbs';
import '../styles/footer-pages.css';
import '../styles/footer-pages-mobile.css';

export default function FooterPageShell({
  variant = 'resources',
  children,
  leftSlot = null,
  rightSlot = null,
  breadcrumbs = null,
}) {
  const { pathname } = useLocation();
  const hub = variant === 'company' ? 'company' : 'resources';
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const leftNav = leftSlot || (variant === 'company' ? <CompanySideNav /> : <ResourcesSideNav />);
  const rightRail = rightSlot || <FooterCtaAside />;
  const crumbs = useMemo(
    () => (breadcrumbs === null ? buildFooterCrumbs(pathname) : breadcrumbs),
    [breadcrumbs, pathname],
  );

  const openDrawer = useCallback(() => setLeftDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setLeftDrawerOpen(false), []);

  useEffect(() => subscribeHubDrawerToggle(hub, openDrawer), [hub, openDrawer]);
  useEffect(() => {
    setLeftDrawerOpen(false);
  }, [pathname]);

  return (
    <div
      className={`fp-page fp-page-shell hub-inner-mobile-shell${
        leftDrawerOpen ? ' fp-page-shell--left-open' : ''
      }`}
      style={{ minHeight: 'var(--et-hub-scroll-height)' }}
    >
      {leftDrawerOpen ? (
        <button
          type="button"
          className="fp-left-drawer-backdrop is-visible"
          aria-label="Close menu"
          onClick={closeDrawer}
        />
      ) : null}

      <div
        className="fp-hub-row"
        style={{ maxHeight: 'var(--et-hub-scroll-height)', flex: 1, minHeight: 0 }}
      >
        <aside
          className={`fp-layout__rail fp-layout__rail--left${leftDrawerOpen ? ' is-drawer-open' : ''}`}
          aria-label="Section navigation"
        >
          {leftNav}
        </aside>
        <div className="fp-layout__center">
          <div className="fp-content-stack">
            {crumbs?.length ? <FooterBreadcrumb items={crumbs} /> : null}
            {children}
          </div>
        </div>
        <aside className="fp-layout__rail fp-layout__rail--right" aria-label="Quick actions">
          {rightRail}
        </aside>
      </div>
    </div>
  );
}
