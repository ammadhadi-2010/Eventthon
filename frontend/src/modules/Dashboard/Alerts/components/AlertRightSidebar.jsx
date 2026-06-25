import React from "react";
import { Bell, History, HelpCircle, Settings, ShieldAlert } from "lucide-react";
import AlertFilterControls from "./AlertFilterControls";

const quickActions = [
  { key: "settings", label: "Notification Settings", hint: "Customize your alerts", icon: Settings },
  { key: "pause", label: "Do Not Disturb", hint: "Pause notifications", icon: Bell },
  { key: "history", label: "Alert History", hint: "View past alerts", icon: History },
  { key: "support", label: "Help & Support", hint: "Get help with alerts", icon: HelpCircle },
];

const AlertRightSidebar = ({
  selectedTypes = [],
  selectedPriorities = [],
  onToggleType,
  onTogglePriority,
  onApplyFilters,
  onClearFilters,
  onQuickAction,
}) => {
  return (
    <aside className="alerts-right-sidebar alerts-right-sidebar-rail">
      <section className="alerts-panel-card">
        <h3>Stay Ahead</h3>
        <p className="alerts-panel-muted">You're doing great. Keep engaging with your network.</p>
        <div className="alerts-ring-wrap">
          <div className="alerts-ring">92%</div>
        </div>
        <p className="alerts-panel-label">
          Response Rate <span>+8% this week</span>
        </p>
      </section>

      <section className="alerts-panel-card">
        <h4>Quick Actions</h4>
        <div className="alerts-actions-list">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.key}
                type="button"
                className="alerts-action-btn"
                onClick={() => onQuickAction?.(action.key)}
              >
                <Icon size={16} />
                <span>
                  <strong>{action.label}</strong>
                  <small>{action.hint}</small>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="alerts-panel-card">
        <AlertFilterControls
          selectedTypes={selectedTypes}
          selectedPriorities={selectedPriorities}
          onToggleType={onToggleType}
          onTogglePriority={onTogglePriority}
          onApplyFilters={onApplyFilters}
          onClearFilters={onClearFilters}
        />
      </section>

      <section className="alerts-panel-card alerts-smart-card">
        <div>
          <h4>Smart Alerts</h4>
          <p>Get AI-powered notifications that matter to you.</p>
        </div>
        <button type="button">
          <ShieldAlert size={15} />
          Upgrade Now
        </button>
      </section>
    </aside>
  );
};

export default AlertRightSidebar;
