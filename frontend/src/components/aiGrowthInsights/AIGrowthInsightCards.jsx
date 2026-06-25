import React from 'react';
import { Link } from 'react-router-dom';
import { ONBOARDING_MESSAGE, PRIORITY_CLASS } from './aiGrowthInsightsConstants';

function insightCardClass(insight) {
  const priority = String(insight?.priority || 'low').toLowerCase();
  return PRIORITY_CLASS[priority] || 'et-ai-insight-card--low';
}

export function InsightCard({ insight, onNavigate }) {
  const actionUrl = String(insight?.action_url || '').trim();
  const actionLabel = String(insight?.action_label || 'Open action').trim();

  return (
    <article className={`et-ai-insight-card ${insightCardClass(insight)}`}>
      <div className="et-ai-insight-meta">
        <span className="et-ai-insight-badge">{insight?.category || 'general'}</span>
        <span className="et-ai-insight-badge">{insight?.type || 'insight'}</span>
      </div>
      <h3 className="et-ai-insight-title">{insight?.title || 'Growth insight'}</h3>
      <p className="et-ai-insight-message">{insight?.message || ''}</p>
      {actionUrl ? (
        <Link className="et-ai-insight-action" to={actionUrl} onClick={onNavigate}>
          {actionLabel} →
        </Link>
      ) : null}
    </article>
  );
}

export function OnboardingScreen({ onNavigate, onSeedSimulation, seeding }) {
  return (
    <div className="et-ai-insights-onboarding">
      <div className="et-ai-insights-onboarding-icon" aria-hidden>
        ✨
      </div>
      <h3 className="et-ai-insights-onboarding-title">AI Growth Engine Ready</h3>
      <p className="et-ai-insights-onboarding-copy">{ONBOARDING_MESSAGE}</p>
      <Link className="et-ai-insight-action" to="/dashboard" onClick={onNavigate}>
        Explore dashboard →
      </Link>
      <button type="button" className="et-ai-insights-seed-btn" onClick={onSeedSimulation} disabled={seeding}>
        {seeding ? 'Seeding mock telemetry logs...' : '🔧 Seed Simulation Mock Telemetry Logs'}
      </button>
    </div>
  );
}
