import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BUSINESS_LOTTIE } from '../../../../components/lottie';
import SidebarSection from './SidebarSection';
import SidebarCardItem from './SidebarCardItem';
import { DASHBOARD_SIDEBAR_ROUTES, UPCOMING_EVENTS } from './dashboardRightSidebarData';

export default function UpcomingEventsSection({ eventState, onRegister }) {
  const navigate = useNavigate();

  return (
    <SidebarSection
      title="Upcoming Events"
      viewAllTo={DASHBOARD_SIDEBAR_ROUTES.events}
      titleLottie={BUSINESS_LOTTIE.analytics}
      titleIconLabel="Upcoming events animation"
    >
      {UPCOMING_EVENTS.map((event) => {
        const registered = eventState[event.id] === 'registered';
        return (
          <SidebarCardItem
            key={event.id}
            icon="E"
            iconColor="#059669"
            title={event.title}
            subtitle={event.when}
            onRowClick={() => navigate(event.path)}
            action={
              <button
                type="button"
                className={`dash-rs-btn dash-rs-btn--register${registered ? ' is-registered' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onRegister(event.id);
                }}
                disabled={registered}
              >
                {registered ? 'Registered' : 'Register'}
              </button>
            }
          />
        );
      })}
    </SidebarSection>
  );
}
