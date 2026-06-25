import React from 'react';

export default function SquadWorkspaceNav({ tabs, activeTab, onTabChange }) {
  return (
    <nav className="sq-ws-nav" aria-label="Squad workspace">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = activeTab === tab.label;
        return (
          <button
            key={tab.label}
            type="button"
            className={`sq-ws-tab${active ? ' is-active' : ''}`}
            onClick={() => onTabChange?.(tab.label)}
          >
            {Icon ? <Icon size={14} strokeWidth={2} /> : null}
            {tab.label}
            {tab.count != null && tab.count > 0 ? (
              <span className="sq-ws-tab-count">{tab.count}</span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}
