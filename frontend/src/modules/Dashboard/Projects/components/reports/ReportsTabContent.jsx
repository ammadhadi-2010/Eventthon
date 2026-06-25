import React from 'react';
import ReportsOverviewPanel from './ReportsOverviewPanel';
import ReportsProjectsPanel from './ReportsProjectsPanel';
import ReportsTeamPanel from './ReportsTeamPanel';
import ReportsFinancialsPanel from './ReportsFinancialsPanel';

const PANELS = {
  overview: ReportsOverviewPanel,
  projects: ReportsProjectsPanel,
  team: ReportsTeamPanel,
  financials: ReportsFinancialsPanel,
};

export default function ReportsTabContent({ activeTab, reports }) {
  const Panel = PANELS[activeTab] || ReportsOverviewPanel;
  return <Panel reports={reports} />;
}
