import React from 'react';
import useDashboardRightSidebar from './useDashboardRightSidebar';
import SuggestedSquadsSection from './SuggestedSquadsSection';
import PeopleYouMayKnowSection from './PeopleYouMayKnowSection';
import TrendingProjectsSection from './TrendingProjectsSection';
import UpcomingEventsSection from './UpcomingEventsSection';
import './dashboard-right-sidebar.css';

export default function DashboardRightSidebar({ userData }) {
  const {
    visiblePeople,
    joinedSquads,
    connectState,
    eventState,
    toggleSquadJoin,
    requestConnect,
    dismissPerson,
    registerEvent,
    trendingProjects,
    suggestedSquads,
  } = useDashboardRightSidebar(userData);

  return (
    <aside className="dash-rs-stack" aria-label="Dashboard recommendations">
      <SuggestedSquadsSection
        joinedSquads={joinedSquads}
        onJoin={toggleSquadJoin}
        squads={suggestedSquads}
      />
      <PeopleYouMayKnowSection
        people={visiblePeople}
        connectState={connectState}
        onConnect={requestConnect}
        onDismiss={dismissPerson}
      />
      <TrendingProjectsSection projects={trendingProjects} />
      <UpcomingEventsSection eventState={eventState} onRegister={registerEvent} />
    </aside>
  );
}
