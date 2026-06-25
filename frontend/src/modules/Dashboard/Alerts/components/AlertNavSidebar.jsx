import React from "react";
import { Bell } from "lucide-react";
import { alertCategories } from "../data/alertsData";

const AlertNavSidebar = ({
  categories = [],
  activeCategory = "all",
  onCategorySelect,
  onManagePreferences,
  extraNavItems = [],
}) => {
  const source = categories.length ? categories : alertCategories;

  return (
    <aside className="alert-left-nav">
      <p className="alert-nav-title">Alert Center</p>

      <div className="alert-nav-list alert-nav-list--lane">
        {source.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.key}
              className={`alert-nav-btn ${activeCategory === category.key ? "is-active" : ""}`}
              type="button"
              onClick={() => onCategorySelect?.(category.key)}
            >
              <span className="alert-nav-btn-left">
                {Icon ? <Icon size={16} /> : <Bell size={16} />}
                {category.label}
              </span>
              <span className="alert-nav-badge">{category.count}</span>
            </button>
          );
        })}
      </div>

      {extraNavItems.length ? (
        <div className="alert-nav-list alert-nav-list--extra">
          {extraNavItems.map((item) => (
            <button
              key={item.key}
              className="alert-nav-btn alert-nav-btn--extra"
              type="button"
              onClick={item.onClick}
            >
              <span className="alert-nav-btn-left">{item.label}</span>
            </button>
          ))}
        </div>
      ) : null}

      <div className="alert-nav-promo">
        <div className="alert-nav-promo-icon">
          <Bell size={18} />
        </div>
        <h4>Never miss what matters</h4>
        <p>Enable smart alerts and stay updated in real-time.</p>
        <button className="alert-nav-promo-btn" type="button" onClick={onManagePreferences}>
          Manage Preferences
        </button>
      </div>
    </aside>
  );
};

export default AlertNavSidebar;

