import React, { useState } from 'react';
import { OverviewPanel, AnalyticsPanel, ActivityPanel } from './ProjectShowroomDetailPanels';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'activity', label: 'Activity' },
];

export default function ProjectShowroomMobileTabs({ data }) {
  const [active, setActive] = useState('overview');

  return (
    <div className="ps-mobile-detail">
      <div className="ps-mobile-tabs" role="tablist" aria-label="Project detail sections">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            className={`ps-mobile-tab${active === tab.id ? ' is-active' : ''}`}
            onClick={() => setActive(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="ps-mobile-panels">
        {active === 'overview' ? <OverviewPanel data={data} /> : null}
        {active === 'analytics' ? <AnalyticsPanel data={data} /> : null}
        {active === 'activity' ? <ActivityPanel data={data} /> : null}
      </div>
    </div>
  );
}
