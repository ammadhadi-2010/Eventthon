import React from 'react';
import useGigsHubMyGigsSideMetrics from '../../hooks/useGigsHubMyGigsSideMetrics';
import GigsRightAnalyticsCard from './GigsRightAnalyticsCard';
import GigsTipsHelpSection from './GigsTipsHelpSection';

export default function GigsRightMyGigsPanel({ onOpenOrders }) {
  const { metrics, loading } = useGigsHubMyGigsSideMetrics();

  return (
    <aside className="gigs-right-stack" aria-label="My Gigs insights">
      <GigsRightAnalyticsCard
        title="Seller Snapshot"
        subtitle="Live counters for your listings"
        metrics={metrics}
        loading={loading}
      />
      <GigsTipsHelpSection onOpenOrders={onOpenOrders} />
    </aside>
  );
}
