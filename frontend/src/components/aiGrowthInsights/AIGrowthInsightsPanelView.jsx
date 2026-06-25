import React from 'react';
import AIGrowthInsightsPanelTabs from './AIGrowthInsightsPanelTabs';
import AIGrowthInsightsGrowthTab from './AIGrowthInsightsGrowthTab';
import AIAssistantChatTab from './AIAssistantChatTab';
import { AI_PANEL_TABS } from './aiGrowthInsightsConstants';

export default function AIGrowthInsightsPanelView({
  activeTab,
  onTabChange,
  onClose,
  growth,
  assistant,
}) {
  return (
    <>
      <div className="et-ai-insights-overlay" onClick={onClose} role="presentation" />
      <aside className="et-ai-insights-panel" role="dialog" aria-modal="true" aria-label="AI intelligence panel">
        <header className="et-ai-insights-header">
          <h2>AI Intelligence Hub</h2>
          <button type="button" className="et-ai-insights-close" onClick={onClose} aria-label="Close AI panel">
            ✕
          </button>
        </header>
        <AIGrowthInsightsPanelTabs activeTab={activeTab} onTabChange={onTabChange} />
        {activeTab === AI_PANEL_TABS.GROWTH ? (
          <AIGrowthInsightsGrowthTab
            isLoading={growth.isLoading}
            error={growth.error}
            showOnboarding={growth.showOnboarding}
            insights={growth.insights}
            seeding={growth.seeding}
            onNavigate={onClose}
            onSeedSimulation={growth.runMockSeed}
          />
        ) : (
          <AIAssistantChatTab
            messages={assistant.messages}
            draft={assistant.draft}
            setDraft={assistant.setDraft}
            isTyping={assistant.isTyping}
            scrollRef={assistant.scrollRef}
            quickChips={assistant.quickChips}
            onSendPrompt={assistant.sendUserPrompt}
            onChipSelect={assistant.sendChipPrompt}
          />
        )}
      </aside>
    </>
  );
}
