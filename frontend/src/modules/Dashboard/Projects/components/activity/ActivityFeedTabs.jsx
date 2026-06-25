import React from 'react';
import { ACTIVITY_TABS } from '../../data/projectActivityData';

export default function ActivityFeedTabs({ activeTab, onChange, tabs = ACTIVITY_TABS }) {
  return (
    <div className="ph-act-tabs" role="tablist" aria-label="Activity filters">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          className={`ph-act-tab${activeTab === tab.id ? ' is-active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label} ({tab.count})
        </button>
      ))}
    </div>
  );
}
