import React, { memo } from 'react';
import { AdminShimmer } from './AdminShimmer';

function PlatformOverviewChartsSkeleton() {
  return (
    <div className="po-charts-grid" aria-busy="true" aria-label="Loading overview charts">
      <div className="admin-card-dark space-y-3 p-5">
        <AdminShimmer className="h-3 w-24" />
        <AdminShimmer className="h-9 w-28" />
        <AdminShimmer className="h-3 w-32" />
        <AdminShimmer className="h-[190px] w-full" />
      </div>
      <div className="admin-card-dark space-y-3 p-5">
        <AdminShimmer className="h-4 w-36" />
        <div className="grid gap-3 lg:grid-cols-[140px_1fr]">
          <AdminShimmer className="mx-auto h-36 w-36 rounded-full" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <AdminShimmer key={i} className="h-8 w-full" />
            ))}
          </div>
        </div>
      </div>
      <div className="admin-card-dark grid grid-cols-2 gap-2 p-4 po-charts-grid__spikes">
        {Array.from({ length: 4 }).map((_, i) => (
          <AdminShimmer key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
}

export default memo(PlatformOverviewChartsSkeleton);
