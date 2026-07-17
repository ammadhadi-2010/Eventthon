import React, { useEffect } from 'react';
import { subscribeHubDrawerToggle } from '../../Navbar/hubDrawerBus';

/** Gigs Hub shell: left 250px | center flex | optional right 320px. */
export default function GigsHubLayout({
  leftRail,
  center,
  rightRail,
  hideRightRail = false,
  scrollDirection = 'up',
  leftDrawerOpen = false,
  onOpenLeftDrawer = () => {},
  onCloseLeftDrawer = () => {},
  mobileSearch = null,
}) {
  const layoutClass = `gigs-layout gigs-hub-layout gigs-mobile-shell__body${
    hideRightRail ? ' gigs-hub-layout--no-right' : ''
  }${leftDrawerOpen ? ' gigs-hub-layout--left-open' : ''}`;
  const centerClass = `gigs-hub-layout__center gigs-hub-center-panel${
    hideRightRail ? ' gigs-hub-center-panel--expanded' : ''
  }`;

  useEffect(() => subscribeHubDrawerToggle('gigs', onOpenLeftDrawer), [onOpenLeftDrawer]);

  return (
    <div className="gigs-page gigs-mobile-shell hub-inner-mobile-shell">
      {leftDrawerOpen ? (
        <button
          type="button"
          className="gigs-left-drawer-backdrop is-visible"
          aria-label="Close gigs menu"
          onClick={onCloseLeftDrawer}
        />
      ) : null}
      <div className={layoutClass}>
        <div className={`gigs-hub-layout__rail gigs-hub-layout__rail--left${leftDrawerOpen ? ' is-drawer-open' : ''}`}>
          {leftRail}
        </div>
        <div className={centerClass}>{center}</div>
        {!hideRightRail && rightRail ? (
          <div className="gigs-hub-layout__rail gigs-hub-layout__rail--right">{rightRail}</div>
        ) : null}
      </div>
    </div>
  );
}
