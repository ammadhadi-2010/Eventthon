import React from 'react';
import { Link } from 'react-router-dom';
import { resolveDashboardMediaUrl } from '../../utils/dashboardMedia';
import { SUGGESTED_SQUADS, DASHBOARD_SIDEBAR_ROUTES } from '../rightSidebar/dashboardRightSidebarData';
import MobileFeedPortraitCard from './MobileFeedPortraitCard';
import './mobileFeedCarousel.css';

export default function MobileFeedSuggestedSquadsCarousel({
  squads = [],
  joinedSquads = {},
  onJoinSquad,
}) {
  const squadRows = squads.length ? squads : SUGGESTED_SQUADS;

  return (
    <section className="dash-mobile-carousel" aria-label="Suggested squads carousel">
      <div className="dash-mobile-carousel__head">
        <h3 className="dash-mobile-carousel__title">Suggested For You</h3>
        <Link to={DASHBOARD_SIDEBAR_ROUTES.squads} className="dash-mobile-carousel__link">
          View all
        </Link>
      </div>
      <div className="dash-mobile-carousel__track">
        {squadRows.map((squad) => {
          const joined = Boolean(joinedSquads[squad.id]);
          const imageurl = resolveDashboardMediaUrl(squad.imageurl);
          return (
            <MobileFeedPortraitCard
              key={`squad-${squad.id}`}
              accentColor={squad.color || '#7c3aed'}
              avatarLabel={String(squad.title || 'S').charAt(0)}
              avatarImage={imageurl}
              name={squad.title}
              subtext={squad.category}
              actionLabel={joined ? 'Joined' : 'Join'}
              disabled={joined}
              onAction={() => onJoinSquad(squad.id)}
            />
          );
        })}
      </div>
    </section>
  );
}
