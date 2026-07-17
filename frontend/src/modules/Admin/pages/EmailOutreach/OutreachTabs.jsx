import React from 'react';
import { OUTREACH_TABS } from './outreachData';

export default function OutreachTabs({ activeTab, counts, onChange }) {
  return (
    <div className="eo-tabs" role="tablist" aria-label="Lead status filters">
      {OUTREACH_TABS.map((item) => {
        const active = item.id === activeTab;
        const count = counts[item.id] ?? 0;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            className={`eo-tab${active ? ' eo-tab--active' : ''}`}
            onClick={() => onChange(item.id)}
          >
            <span>{item.label}</span>
            <span className="eo-tab__count">({count.toLocaleString()})</span>
          </button>
        );
      })}
    </div>
  );
}
