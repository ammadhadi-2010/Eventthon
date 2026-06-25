import React from "react";
import { X } from "lucide-react";
import { formatPriorityLabel, sanitizeAlertCopy } from "../utils/alertMessageCopy";

const AlertDetailModal = ({ alert, onClose }) => {
  if (!alert) return null;

  return (
    <div className="alerts-modal-overlay" onClick={onClose}>
      <div className="alerts-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="alerts-modal-head">
          <h3>{alert.title || "Notification"}</h3>
          <button type="button" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <p className="alerts-modal-message">
          {sanitizeAlertCopy(alert.message, "Thank you for helping us improve our system design.")}
        </p>
        <p className="alerts-modal-details">
          {sanitizeAlertCopy(alert.details, "No additional details available.")}
        </p>

        <div className="alerts-modal-meta">
          <span>Category: {alert.category || "general"}</span>
          <span>Priority: {formatPriorityLabel(alert.priority)}</span>
        </div>

        {alert.action_url ? (
          <a className="alerts-modal-action" href={alert.action_url}>
            {alert.action_label || "Open"}
          </a>
        ) : null}
      </div>
    </div>
  );
};

export default AlertDetailModal;

