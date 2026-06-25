import React from 'react';
import ProjectShowroomMetrics from './ProjectShowroomMetrics';
import ProjectShowroomTeam from './ProjectShowroomTeam';
import ProjectShowroomHighlights from './ProjectShowroomHighlights';
import ShowroomGuestCta from '../ShowroomGuestCta';
import ProjectShowroomMobileTabs from './ProjectShowroomMobileTabs';
import { OverviewPanel, AnalyticsPanel, ActivityPanel } from './ProjectShowroomDetailPanels';

export default function ProjectShowroomDualGrid({
  data,
  isGuest,
  collabBullets,
  joinBullets,
}) {
  return (
    <div className="ps-dual-core">
      <div className="ps-dual-core__showcase">
        <ProjectShowroomMetrics metrics={data.metrics} seoMetrics={data.seo_metrics} />
        <ProjectShowroomTeam members={data.teamMembers} />
        {isGuest ? (
          <ShowroomGuestCta
            title="Want to Collaborate?"
            bullets={collabBullets}
            variant="tiles"
          />
        ) : null}
        <ProjectShowroomHighlights
          highlights={data.highlights}
          milestones={data.milestones}
          progress={data.milestoneProgress}
          milestonesBelow
        />
      </div>

      <div className="ps-dual-core__overview">
        <div className="ps-desktop-panels" aria-label="Detailed overview">
          <OverviewPanel data={data} />
          <AnalyticsPanel data={data} />
          <ActivityPanel data={data} />
        </div>
        <ProjectShowroomMobileTabs data={data} />
      </div>

      {isGuest ? (
        <div className="ps-dual-core__join">
          <ShowroomGuestCta
            title="Join the Collaboration"
            bullets={joinBullets}
            variant="tiles"
            actionLabel="Sign in to Collaborate"
          />
        </div>
      ) : null}
    </div>
  );
}
