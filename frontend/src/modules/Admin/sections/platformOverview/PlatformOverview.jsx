import React, { memo } from 'react';
import useOverviewTab from '../../hooks/useOverviewTab';
import PlatformOverviewCharts from './PlatformOverviewCharts';
import PlatformOverviewTable from './PlatformOverviewTable';
import PlatformOverviewTabs from './PlatformOverviewTabs';

function PlatformOverview({ viewMode }) {
  const { activeTab, onTabChange, tab, loading, error } = useOverviewTab(viewMode);

  return (
    <div className="admin-card-dark admin-platform-overview p-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-black">Platform Overview</h3>
          <p className="text-sm text-slate-500">Live operational insight across the network.</p>
        </div>
        <div className="admin-chip flex items-center gap-2 px-3 py-2 text-[11px] font-bold text-slate-400">
          Weekly
        </div>
      </div>

      <PlatformOverviewTabs activeTab={activeTab} onChange={onTabChange} />
      {error ? <p className="mt-3 text-sm text-rose-400">{error}</p> : null}
      <div className="mt-4">
        <PlatformOverviewCharts tab={tab} loading={loading} />
        <PlatformOverviewTable tab={tab} loading={loading} />
      </div>
    </div>
  );
}

export default memo(PlatformOverview);
