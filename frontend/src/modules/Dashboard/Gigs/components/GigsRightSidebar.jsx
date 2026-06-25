import React from 'react';
import useGigOverviewMetrics from '../hooks/useGigOverviewMetrics';
import GigsOverviewCard from './rightSidebar/GigsOverviewCard';
import GigsRecommendedSection from './rightSidebar/GigsRecommendedSection';
import GigsFreelancersSection from './rightSidebar/GigsFreelancersSection';
import GigsTipsHelpSection from './rightSidebar/GigsTipsHelpSection';

export default function GigsRightSidebar({ onGoToMyGigs, onOpenOrders }) {
  const { metrics, togglePeriod, formattedEarnings } = useGigOverviewMetrics();

  return (
    <aside className="gigs-right-stack" aria-label="Gigs hub insights">
      <GigsOverviewCard
        metrics={metrics}
        formattedEarnings={formattedEarnings}
        onTogglePeriod={togglePeriod}
        onGoToMyGigs={onGoToMyGigs}
      />
      <GigsRecommendedSection />
      <GigsFreelancersSection />
      <GigsTipsHelpSection onOpenOrders={onOpenOrders} />
    </aside>
  );
}
