import React from 'react';
import { REPORTS_TABS } from '../../data/reportsData';

export default function ReportsTabs({ activeTab, onChange }) {
  return (
    <div className="ph-rpt-tabs" role="tablist" aria-label="Report sections">
      {REPORTS_TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          className={`ph-rpt-tab${activeTab === tab.id ? ' is-active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
