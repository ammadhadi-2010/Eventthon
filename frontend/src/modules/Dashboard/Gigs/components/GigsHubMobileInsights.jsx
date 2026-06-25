import React from 'react';
import useGigOverviewMetrics from '../hooks/useGigOverviewMetrics';
import GigsOverviewCard from './rightSidebar/GigsOverviewCard';
import GigsRecommendedSection from './rightSidebar/GigsRecommendedSection';
import GigsFreelancersSection from './rightSidebar/GigsFreelancersSection';
import GigsTipsHelpSection from './rightSidebar/GigsTipsHelpSection';

/** Mobile-only insights stack — mirrors desktop right rail below Featured Gigs. */
export default function GigsHubMobileInsights({ onGoToMyGigs, onOpenOrders }) {
  const { metrics, togglePeriod, formattedEarnings } = useGigOverviewMetrics();

  return (
    <div className="gigs-mobile-insights" aria-label="Gigs hub insights">
      <GigsOverviewCard
        metrics={metrics}
        formattedEarnings={formattedEarnings}
        onTogglePeriod={togglePeriod}
        onGoToMyGigs={onGoToMyGigs}
      />
      <GigsRecommendedSection />
      <GigsFreelancersSection />
      <GigsTipsHelpSection onOpenOrders={onOpenOrders} />
    </div>
  );
}
