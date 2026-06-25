import React from 'react';

export default function JobsStatusTabs({ tabs, activeId, onChange }) {
  return (
    <div className="jh-status-tabs" role="tablist" aria-label="Filter applications">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeId === tab.id}
          className={`jh-status-tabs__item${activeId === tab.id ? ' is-active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label} ({tab.count})
        </button>
      ))}
    </div>
  );
}
