import React, { useState } from "react";
import HubMobileTopBar from "../../components/mobile/HubMobileTopBar";
import { HUB_MOBILE_SEARCH } from "../../components/mobile/hubMobileSearchPresets";
import AlertsMobileActionStrip from "./AlertsMobileActionStrip";
import AlertsQuickActionsMenu from "./AlertsQuickActionsMenu";

const AlertsMobileChrome = ({
  isVisible = true,
  toolbarOnly = false,
  onOpenLeftDrawer,
  onMarkAllRead,
  marking = false,
  onOpenFilters,
  onQuickAction,
  searchQuery,
  onSearchQueryChange,
}) => {
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);

  return (
    <div
      className={`alerts-mobile-chrome${toolbarOnly ? " alerts-mobile-chrome--toolbar-only" : ""}${
        isVisible ? "" : " alerts-mobile-chrome--hidden"
      }`}
      aria-hidden={!isVisible}
    >
      {!toolbarOnly ? (
        <HubMobileTopBar
          wrapChrome={false}
          searchQuery={searchQuery}
          onSearchQueryChange={onSearchQueryChange}
          onAvatarClick={onOpenLeftDrawer}
          avatarAriaLabel="Open alert categories menu"
          {...HUB_MOBILE_SEARCH.alerts}
        />
      ) : null}
      <div className="alerts-mobile-controls-wrap">
        <AlertsMobileActionStrip
          onOpenLeftDrawer={onOpenLeftDrawer}
          onMarkAllRead={onMarkAllRead}
          marking={marking}
          onOpenFilters={onOpenFilters}
          onToggleQuickMenu={() => setQuickMenuOpen((v) => !v)}
          quickMenuOpen={quickMenuOpen}
        />
        <AlertsQuickActionsMenu
          open={quickMenuOpen}
          onClose={() => setQuickMenuOpen(false)}
          onQuickAction={onQuickAction}
        />
      </div>
    </div>
  );
};

export default AlertsMobileChrome;
