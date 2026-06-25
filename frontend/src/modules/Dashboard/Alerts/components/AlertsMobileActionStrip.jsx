import React from "react";
import { FiMenu } from "react-icons/fi";
import { Check, Filter, MoreHorizontal } from "lucide-react";

const AlertsMobileActionStrip = ({
  onOpenLeftDrawer,
  onMarkAllRead,
  marking = false,
  onOpenFilters,
  onToggleQuickMenu,
  quickMenuOpen = false,
}) => (
  <div className="alerts-mobile-action-strip" role="toolbar" aria-label="Alerts quick actions">
    <button
      type="button"
      className="alerts-mobile-action-strip__btn alerts-mobile-action-strip__btn--menu"
      aria-label="Open alert categories menu"
      onClick={onOpenLeftDrawer}
    >
      <FiMenu size={15} aria-hidden />
      Menu
    </button>

    <button      type="button"
      className="alerts-mobile-action-strip__btn alerts-mobile-action-strip__btn--read"
      onClick={onMarkAllRead}
      disabled={marking}
    >
      <Check size={14} aria-hidden />
      {marking ? "Syncing..." : "Mark all as read"}
    </button>

    <button
      type="button"
      className="alerts-mobile-action-strip__btn alerts-mobile-action-strip__btn--filter"
      onClick={onOpenFilters}
    >
      <Filter size={14} aria-hidden />
      Filter Alerts
    </button>

    <button
      type="button"
      className="alerts-mobile-action-strip__btn alerts-mobile-action-strip__btn--more"
      aria-label="Quick actions menu"
      aria-expanded={quickMenuOpen}
      onClick={onToggleQuickMenu}
    >
      <MoreHorizontal size={16} aria-hidden />
    </button>
  </div>
);

export default AlertsMobileActionStrip;
