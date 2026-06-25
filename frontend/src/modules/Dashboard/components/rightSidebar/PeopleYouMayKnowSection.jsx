import React from 'react';
import { BUSINESS_LOTTIE } from '../../../../components/lottie';
import SidebarSection from './SidebarSection';
import SidebarCardItem from './SidebarCardItem';
import { DASHBOARD_SIDEBAR_ROUTES } from './dashboardRightSidebarData';

export default function PeopleYouMayKnowSection({ people, connectState, onConnect, onDismiss }) {
  if (!people.length) {
    return (
      <SidebarSection
        title="People You May Know"
        viewAllTo={DASHBOARD_SIDEBAR_ROUTES.people}
        titleLottie={BUSINESS_LOTTIE.success}
        titleIconLabel="People suggestions animation"
      >
        <p className="dash-rs-empty">No suggestions right now.</p>
      </SidebarSection>
    );
  }

  return (
    <SidebarSection
      title="People You May Know"
      viewAllTo={DASHBOARD_SIDEBAR_ROUTES.people}
      titleLottie={BUSINESS_LOTTIE.success}
      titleIconLabel="People suggestions animation"
    >
      {people.map((person) => {
        const pending = connectState[person.id] === 'pending';
        return (
          <SidebarCardItem
            key={person.id}
            icon={person.name.charAt(0)}
            iconColor="#334155"
            title={person.name}
            subtitle={person.role}
            meta={`${person.mutual} mutual connections`}
            onDismiss={() => onDismiss(person.id)}
            action={
              <button
                type="button"
                className={`dash-rs-btn dash-rs-btn--connect${pending ? ' is-pending' : ''}`}
                onClick={() => onConnect(person.id)}
                disabled={pending}
              >
                {pending ? 'Pending' : 'Connect'}
              </button>
            }
          />
        );
      })}
    </SidebarSection>
  );
}
