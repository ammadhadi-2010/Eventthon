import React, { useEffect } from 'react';
import { subscribeHubDrawerToggle } from '../../Navbar/hubDrawerBus';

/** Wallet Hub shell: left 250px | center flex | right 320px. */
export default function WalletHubLayout({
  leftRail,
  center,
  rightRail,
  leftDrawerOpen = false,
  onOpenLeftDrawer = () => {},
  onCloseLeftDrawer = () => {},
}) {
  const layoutClass = `wallet-hub-layout${leftDrawerOpen ? ' wallet-hub-layout--left-open' : ''}`;

  useEffect(() => subscribeHubDrawerToggle('wallet', onOpenLeftDrawer), [onOpenLeftDrawer]);

  return (
    <div className="wallet-page wallet-mobile-shell hub-inner-mobile-shell">
      {leftDrawerOpen ? (
        <button
          type="button"
          className="wallet-left-drawer-backdrop is-visible"
          aria-label="Close wallet menu"
          onClick={onCloseLeftDrawer}
        />
      ) : null}
      <div className={layoutClass}>
        <div className={`wallet-hub-layout__rail wallet-hub-layout__rail--left${leftDrawerOpen ? ' is-drawer-open' : ''}`}>
          {leftRail}
        </div>
        <div className="wallet-hub-layout__center">{center}</div>
        {rightRail ? <div className="wallet-hub-layout__rail wallet-hub-layout__rail--right">{rightRail}</div> : null}
      </div>
    </div>
  );
}
