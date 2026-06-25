import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import AIGrowthInsightsPanelView from './aiGrowthInsights/AIGrowthInsightsPanelView';
import useAIGrowthInsights from './aiGrowthInsights/useAIGrowthInsights';
import useAIAssistantChat from './aiGrowthInsights/useAIAssistantChat';
import { AI_PANEL_TABS } from './aiGrowthInsights/aiGrowthInsightsConstants';
import './ai-growth-insights.css';
import './ai-growth-insights-tabs.css';
import './ai-assistant-chat.css';

function isAdminRoute(pathname = '') {
  return String(pathname).startsWith('/admin');
}

export default function AIGrowthInsights({
  hideFab = false,
  open: controlledOpen,
  onOpenChange,
  stackTrigger = false,
}) {
  const { pathname } = useLocation();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const [activeTab, setActiveTab] = useState(AI_PANEL_TABS.GROWTH);
  const growth = useAIGrowthInsights(open);
  const assistant = useAIAssistantChat(open);

  if (isAdminRoute(pathname)) return null;

  const openPanel = () => {
    setActiveTab(AI_PANEL_TABS.GROWTH);
    setOpen(true);
    growth.fetchInsights();
  };

  const closePanel = () => setOpen(false);
  const rootClass = stackTrigger ? 'et-ai-hub-root et-ai-hub-root--stack' : 'et-ai-hub-root';

  return (
    <span className={rootClass}>
      {hideFab ? null : (
        <button
          type="button"
          className={stackTrigger ? 'et-floating-stack__btn et-floating-stack__btn--ai' : 'et-ai-insights-fab'}
          onClick={openPanel}
          aria-label="Open AI intelligence hub"
          title="AI Intelligence Hub"
        >
          {stackTrigger ? (
            <span className="et-floating-stack__ai-icon" aria-hidden>
              ✨
            </span>
          ) : (
            '✨ AI Intelligence Hub'
          )}
        </button>
      )}
      {open
        ? createPortal(
            <AIGrowthInsightsPanelView
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onClose={closePanel}
              growth={growth}
              assistant={assistant}
            />,
            document.body,
          )
        : null}
    </span>
  );
}
