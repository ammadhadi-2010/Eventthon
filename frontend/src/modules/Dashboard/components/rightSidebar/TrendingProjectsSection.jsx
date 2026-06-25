import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BUSINESS_LOTTIE } from '../../../../components/lottie';
import { resolveDashboardMediaUrl } from '../../utils/dashboardMedia';
import SidebarSection from './SidebarSection';
import SidebarCardItem from './SidebarCardItem';
import { DASHBOARD_SIDEBAR_ROUTES, TRENDING_PROJECTS } from './dashboardRightSidebarData';

export default function TrendingProjectsSection({ projects = [] }) {
  const navigate = useNavigate();
  const rows = projects.length ? projects : TRENDING_PROJECTS;

  return (
    <SidebarSection
      title="Trending Projects"
      viewAllTo={DASHBOARD_SIDEBAR_ROUTES.projects}
      titleLottie={BUSINESS_LOTTIE.rocket}
      titleIconLabel="Trending projects animation"
    >
      {rows.map((project) => {
        const img = resolveDashboardMediaUrl(project.imageurl);
        return (
          <SidebarCardItem
            key={project.id}
            icon={img ? <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} /> : 'P'}
            iconColor="#7c3aed"
            title={project.title}
            subtitle={project.tag}
            onRowClick={() => navigate(project.path || '/projects')}
          />
        );
      })}
    </SidebarSection>
  );
}
