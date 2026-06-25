import React, { memo } from 'react';
import { AdminShimmer } from './AdminShimmer';

function StatsGridSkeleton() {
  return (
    <div className="admin-skeleton-stat-grid" aria-busy="true" aria-label="Loading dashboard stats">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="admin-stat-card p-4">
          <AdminShimmer className="mb-3 h-3 w-20" />
          <AdminShimmer className="mb-4 h-8 w-24" />
          <AdminShimmer className="mb-4 h-3 w-32" />
          <AdminShimmer className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}

export default memo(StatsGridSkeleton);
