import React from 'react';
import { AI_PANEL_TABS } from './aiGrowthInsightsConstants';

const TAB_ITEMS = [
  { key: AI_PANEL_TABS.GROWTH, label: '🔮 Growth Insights' },
  { key: AI_PANEL_TABS.ASSISTANT, label: '🤖 AI Assistant' },
];

export default function AIGrowthInsightsPanelTabs({ activeTab, onTabChange }) {
  return (
    <nav className="et-ai-panel-tabs" aria-label="AI panel sections">
      {TAB_ITEMS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          className={`et-ai-panel-tabs__btn${activeTab === tab.key ? ' et-ai-panel-tabs__btn--active' : ''}`}
          onClick={() => onTabChange(tab.key)}
          aria-selected={activeTab === tab.key}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
