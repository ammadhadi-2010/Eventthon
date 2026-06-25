import React, { memo, useMemo } from 'react';
import PlatformOverviewChartsSkeleton from '../../components/skeleton/PlatformOverviewChartsSkeleton';
import AreaTrendChart from '../charts/AreaTrendChart';
import DonutSummaryChart from '../charts/DonutSummaryChart';
import PlatformOverviewSpikeGrid from './PlatformOverviewSpikeGrid';
import './platform-overview-charts.css';

function PlatformOverviewCharts({ tab, loading }) {
  const breakdown = useMemo(() => tab?.breakdown || [], [tab]);

  if (loading && !tab) {
    return <PlatformOverviewChartsSkeleton />;
  }

  if (!tab) return null;

  return (
    <div className="po-charts-grid">
      <div className="admin-card-dark po-charts-grid__growth p-5">
        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{tab.metricLabel}</p>
        <div className="mt-2 text-3xl font-black">{tab.total}</div>
        <p className="mt-1 text-xs font-bold text-emerald-400">{tab.change}</p>
        <AreaTrendChart
          points={tab.points || []}
          color={tab.color || '#8b5cf6'}
          labels={tab.labels || []}
        />
      </div>

      <div className="admin-card-dark po-charts-grid__breakdown p-5">
        <h4 className="text-sm font-black text-white">{tab.breakdownTitle}</h4>
        <div className="po-breakdown-grid mt-2">
          <div className="po-breakdown-grid__donut flex justify-start">
            <DonutSummaryChart centerValue={tab.total} centerLabel="Total" />
          </div>
          <div className="space-y-3">
            {breakdown.map((row) => (
              <div key={row.label} className="flex items-start gap-3 text-sm">
                <div
                  className="mt-1 h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: row.color }}
                />
                <div className="flex-1">
                  <div className="text-slate-300">{row.label}</div>
                  <div className="text-xs leading-5 text-slate-500">
                    {row.value} ({row.share})
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="admin-card-dark po-charts-grid__spikes flex flex-col p-4">
        <h4 className="mb-3 text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
          WoW Spikes
        </h4>
        <PlatformOverviewSpikeGrid metrics={tab.spikeMetrics} />
      </div>
    </div>
  );
}

export default memo(PlatformOverviewCharts);
