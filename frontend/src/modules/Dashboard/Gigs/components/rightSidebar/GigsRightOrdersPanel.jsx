import React from 'react';
import useGigsHubOrdersSideMetrics from '../../hooks/useGigsHubOrdersSideMetrics';
import GigsRightAnalyticsCard from './GigsRightAnalyticsCard';
import GigsTipsHelpSection from './GigsTipsHelpSection';

export default function GigsRightOrdersPanel({ onOpenOrders }) {
  const { metrics, loading } = useGigsHubOrdersSideMetrics();

  return (
    <aside className="gigs-right-stack" aria-label="Orders insights">
      <GigsRightAnalyticsCard
        title="Order Analytics"
        subtitle="Fulfillment and dispute trackers"
        metrics={metrics}
        loading={loading}
      />
      <GigsTipsHelpSection onOpenOrders={onOpenOrders} />
    </aside>
  );
}
