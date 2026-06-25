import React from "react";
import { Check } from "lucide-react";

const AlertsHeader = ({ onMarkAllRead, busy }) => {
  return (
    <header className="alerts-header">
      <div>
        <h1>All Alerts</h1>
        <p>Stay updated with everything happening in your network.</p>
      </div>
      <button
        type="button"
        className="alerts-mark-read-btn"
        onClick={() => typeof onMarkAllRead === "function" && onMarkAllRead()}
        disabled={busy}
      >
        <Check size={15} />
        {busy ? "Syncing..." : "Mark all as read"}
      </button>
    </header>
  );
};

export default AlertsHeader;

