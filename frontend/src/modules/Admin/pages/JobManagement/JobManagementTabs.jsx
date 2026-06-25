import React from 'react';
import { JOB_MGMT_TABS } from './jobData';

export default function JobManagementTabs({ activeTab, onTabChange }) {
  return (
    <div className="um-toolbar-tabs jm-page-tabs">
      {JOB_MGMT_TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`um-tab ${activeTab === tab.id ? 'um-tab--active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
