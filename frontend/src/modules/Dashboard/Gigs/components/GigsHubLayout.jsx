import React from 'react';
import HubMobileTopBar from '../../components/mobile/HubMobileTopBar';
import { HUB_MOBILE_SEARCH } from '../../components/mobile/hubMobileSearchPresets';

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

  return (
    <div className="gigs-page gigs-mobile-shell">
      <HubMobileTopBar
        scrollDirection={scrollDirection}
        onAvatarClick={onOpenLeftDrawer}
        avatarAriaLabel="Open gigs menu"
        searchQuery={mobileSearch?.searchTerm}
        onSearchChange={mobileSearch?.onSearchTermChange}
        onSearch={mobileSearch?.onSearch}
        {...HUB_MOBILE_SEARCH.gigs}
      />
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
