import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { subscribeHubDrawerToggle } from '../../Dashboard/Navbar/hubDrawerBus';
import FooterBreadcrumb from '../../FooterPages/components/FooterBreadcrumb';
import { buildFooterCrumbs } from '../../FooterPages/utils/footerBreadcrumbs';

/** Donation hub shell: left rail → mobile logo drawer; main content center. */
export default function DonationHubLayout({ sidebar, children }) {
  const { pathname } = useLocation();
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const crumbs = useMemo(() => buildFooterCrumbs(pathname), [pathname]);

  const openDrawer = useCallback(() => setLeftDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setLeftDrawerOpen(false), []);

  useEffect(() => subscribeHubDrawerToggle('donate', openDrawer), [openDrawer]);
  useEffect(() => {
    setLeftDrawerOpen(false);
  }, [pathname]);

  return (
    <div
      className={`donation-page donation-mobile-shell hub-inner-mobile-shell${
        leftDrawerOpen ? ' donation-page--left-open' : ''
      }`}
    >
      {leftDrawerOpen ? (
        <button
          type="button"
          className="donation-left-drawer-backdrop is-visible"
          aria-label="Close donation menu"
          onClick={closeDrawer}
        />
      ) : null}

      <div className={`donation-hub-layout${leftDrawerOpen ? ' donation-hub-layout--left-open' : ''}`}>
        <div
          className={`donation-hub-layout__rail donation-hub-layout__rail--left${
            leftDrawerOpen ? ' is-drawer-open' : ''
          }`}
        >
          {sidebar}
        </div>
        <div className="donation-hub-layout__center">
          {crumbs?.length ? <FooterBreadcrumb items={crumbs} /> : null}
          {children}
        </div>
      </div>
    </div>
  );
}
