import React from 'react';
import CampaignStatsCards from './CampaignStatsCards';
import CampaignPerformancePanel from './CampaignPerformancePanel';
import RecentCampaignsPanel from './RecentCampaignsPanel';
import OutreachActivityFeed from './OutreachActivityFeed';
import OutreachTemplatesList from './OutreachTemplatesList';
import OutreachRepliesPanel from './OutreachRepliesPanel';

export default function CampaignDashboard({ onOpenComposer, templateProps = {}, refreshKey = 0 }) {
  return (
    <div className="eo-dashboard">
      <CampaignStatsCards refreshKey={refreshKey} />
      <div className="eo-dashboard__split">
        <CampaignPerformancePanel refreshKey={refreshKey} />
        <RecentCampaignsPanel onOpenComposer={onOpenComposer} />
      </div>
      <OutreachRepliesPanel refreshKey={refreshKey} limit={6} />
      <div className="eo-dashboard__widgets">
        <OutreachActivityFeed refreshKey={refreshKey} onViewAll={() => window.alert('Full activity history coming soon.')} />
        <OutreachTemplatesList {...templateProps} onViewAll={() => onOpenComposer?.()} />
      </div>
    </div>
  );
}
