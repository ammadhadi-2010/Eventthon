import React from 'react';
import { InsightCard, OnboardingScreen } from './AIGrowthInsightCards';

export default function AIGrowthInsightsGrowthTab({
  isLoading,
  error,
  showOnboarding,
  insights,
  seeding,
  onNavigate,
  onSeedSimulation,
}) {
  return (
    <div className="et-ai-insights-body">
      {isLoading ? (
        <div className="et-ai-insights-loading">
          <div className="et-ai-insights-spinner" aria-hidden />
          <p>Calculating personalized growth signals...</p>
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="et-ai-insights-onboarding et-ai-insights-onboarding--error">
          <p className="et-ai-insights-onboarding-copy">{error}</p>
        </div>
      ) : null}

      {showOnboarding ? (
        <OnboardingScreen onNavigate={onNavigate} onSeedSimulation={onSeedSimulation} seeding={seeding} />
      ) : null}

      {!isLoading && !error && insights.length > 0
        ? insights.map((insight) => (
            <InsightCard
              key={String(insight.id || insight.title)}
              insight={insight}
              onNavigate={onNavigate}
            />
          ))
        : null}
    </div>
  );
}
