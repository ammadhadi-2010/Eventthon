import React, { memo } from 'react';
import { AdminShimmer, AdminShimmerRow } from './AdminShimmer';

function PlatformOverviewTableSkeleton() {
  return (
    <div className="admin-card-dark mt-4 overflow-hidden p-0" aria-busy="true" aria-label="Loading summary grid">
      <div className="border-b border-white/5 px-5 py-4">
        <AdminShimmer className="mb-2 h-4 w-28" />
        <AdminShimmer className="h-3 w-48" />
      </div>
      <table className="admin-table w-full text-left text-sm">
        <thead>
          <tr>
            {Array.from({ length: 4 }).map((_, i) => (
              <th key={i} className="px-5 py-3">
                <AdminShimmer className="h-3 w-16" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, i) => (
            <AdminShimmerRow key={i} cols={4} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default memo(PlatformOverviewTableSkeleton);
