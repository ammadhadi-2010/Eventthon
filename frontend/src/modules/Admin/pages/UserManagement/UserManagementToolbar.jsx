import React from 'react';
import { USER_FILTER_TABS } from './userManagementData';

export default function UserManagementToolbar({ activeTab, onTabChange }) {
  return (
    <div className="um-toolbar um-toolbar--tight">
      <div className="um-toolbar-tabs um-toolbar-tabs--scroll" role="tablist" aria-label="User filters">
        {USER_FILTER_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`um-tab um-tab--tight um-tab--single-row touch-manipulation ${activeTab === tab.id ? 'um-tab--active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
