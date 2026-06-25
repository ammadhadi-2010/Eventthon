import React from 'react';
import { Link } from 'react-router-dom';
import { PEOPLE_SUGGESTIONS, DASHBOARD_SIDEBAR_ROUTES } from '../rightSidebar/dashboardRightSidebarData';
import MobileFeedPortraitCard from './MobileFeedPortraitCard';
import './mobileFeedCarousel.css';

export default function MobileFeedPeopleCarousel({
  people = [],
  connectState = {},
  onConnect,
}) {
  const peopleRows = people.length ? people : PEOPLE_SUGGESTIONS.slice(0, 6);

  return (
    <section className="dash-mobile-carousel" aria-label="People you may know carousel">
      <div className="dash-mobile-carousel__head">
        <h3 className="dash-mobile-carousel__title">People You May Know</h3>
        <Link to={DASHBOARD_SIDEBAR_ROUTES.people} className="dash-mobile-carousel__link">
          View all
        </Link>
      </div>
      <div className="dash-mobile-carousel__track">
        {peopleRows.map((person) => {
          const pending = connectState[person.id] === 'pending';
          return (
            <MobileFeedPortraitCard
              key={`person-${person.id}`}
              accentColor="#06b6d4"
              avatarLabel={String(person.name || 'U').charAt(0)}
              name={person.name}
              subtext={person.role}
              actionLabel={pending ? 'Pending' : 'Connect'}
              disabled={pending}
              onAction={() => onConnect(person.id)}
            />
          );
        })}
      </div>
    </section>
  );
}
