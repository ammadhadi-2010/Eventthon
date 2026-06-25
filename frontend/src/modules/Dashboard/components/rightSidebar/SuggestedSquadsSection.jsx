import React from 'react';
import { FiCheck } from 'react-icons/fi';
import { BUSINESS_LOTTIE } from '../../../../components/lottie';
import { resolveDashboardMediaUrl } from '../../utils/dashboardMedia';
import SidebarSection from './SidebarSection';
import SidebarCardItem from './SidebarCardItem';
import { DASHBOARD_SIDEBAR_ROUTES, SUGGESTED_SQUADS } from './dashboardRightSidebarData';

export default function SuggestedSquadsSection({ joinedSquads, onJoin, squads = [] }) {
  const rows = squads.length ? squads : SUGGESTED_SQUADS;
  return (
    <SidebarSection
      title="Suggested For You"
      viewAllTo={DASHBOARD_SIDEBAR_ROUTES.squads}
      titleLottie={BUSINESS_LOTTIE.network}
      titleIconLabel="Suggested squads animation"
    >
      {rows.map((squad) => {
        const joined = Boolean(joinedSquads[squad.id]);
        const img = resolveDashboardMediaUrl(squad.imageurl);
        return (
          <SidebarCardItem
            key={squad.id}
            icon={img ? <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} /> : squad.title.charAt(0)}
            iconColor={squad.color}
            title={squad.title}
            subtitle={squad.category}
            meta={`${squad.members} members`}
            action={
              <button
                type="button"
                className={`dash-rs-btn dash-rs-btn--join${joined ? ' is-joined' : ''}`}
                onClick={() => onJoin(squad.id)}
                disabled={joined}
              >
                {joined ? (
                  <>
                    <FiCheck size={14} aria-hidden /> Joined
                  </>
                ) : (
                  'Join'
                )}
              </button>
            }
          />
        );
      })}
    </SidebarSection>
  );
}
