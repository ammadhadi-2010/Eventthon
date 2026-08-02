import React, { useState } from 'react';
import AlertsMobileActionStrip from './AlertsMobileActionStrip';
import AlertsQuickActionsMenu from './AlertsQuickActionsMenu';

/** Mobile action toolbar only — global MemberNavbar owns the top bar. */
const AlertsMobileChrome = ({
  onMarkAllRead,
  marking = false,
  onOpenFilters,
  onQuickAction,
}) => {
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);

  return (
    <div className="alerts-mobile-chrome alerts-mobile-chrome--toolbar-only">
      <div className="alerts-mobile-controls-wrap">
        <AlertsMobileActionStrip
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
