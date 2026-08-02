import React from 'react';
import useDashboardRightSidebar from './useDashboardRightSidebar';
import SuggestedSquadsSection from './SuggestedSquadsSection';
import TrendingProjectsSection from './TrendingProjectsSection';
import UpcomingEventsSection from './UpcomingEventsSection';
import './dashboard-right-sidebar.css';

export default function DashboardRightSidebar({ userData }) {
  const {
    joinedSquads,
    toggleSquadJoin,
    suggestedSquads,
    eventState,
    registerEvent,
    trendingProjects,
  } = useDashboardRightSidebar(userData);

  return (
    <aside className="dash-rs-stack" aria-label="Dashboard recommendations">
      <SuggestedSquadsSection
        joinedSquads={joinedSquads}
        onJoin={toggleSquadJoin}
        squads={suggestedSquads}
      />
      <TrendingProjectsSection projects={trendingProjects} />
      <UpcomingEventsSection eventState={eventState} onRegister={registerEvent} />
    </aside>
  );
}