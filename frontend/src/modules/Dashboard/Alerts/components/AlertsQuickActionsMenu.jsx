import React, { useEffect, useRef } from "react";
import { Bell, History, HelpCircle, Settings } from "lucide-react";

const quickActions = [
  { key: "settings", label: "Notification Settings", hint: "Customize your alerts", icon: Settings },
  { key: "pause", label: "Do Not Disturb", hint: "Pause notifications", icon: Bell },
  { key: "history", label: "Alert History", hint: "View past alerts", icon: History },
  { key: "support", label: "Help & Support", hint: "Get help with alerts", icon: HelpCircle },
];

const AlertsQuickActionsMenu = ({ open, onClose, onQuickAction }) => {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose?.();
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("touchstart", onDoc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("touchstart", onDoc);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="alerts-quick-menu" ref={panelRef} role="menu" aria-label="Quick actions">
      {quickActions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.key}
            type="button"
            className="alerts-quick-menu__item"
            role="menuitem"
            onClick={() => {
              onQuickAction?.(action.key);
              onClose?.();
            }}
          >
            <Icon size={16} aria-hidden />
            <span>
              <strong>{action.label}</strong>
              <small>{action.hint}</small>
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default AlertsQuickActionsMenu;
