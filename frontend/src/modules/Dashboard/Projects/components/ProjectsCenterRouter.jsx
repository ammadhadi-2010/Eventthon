import React, { memo } from 'react';
import ProjectsHubActionBar from './ProjectsHubActionBar';
import Overview from '../views/Overview';
import MyProjects from '../views/MyProjects';
import Collaborations from '../views/Collaborations';
import Templates from '../views/Templates';
import ExploreProjects from '../views/ExploreProjects';
import SavedProjects from '../views/SavedProjects';
import Funding from '../views/Funding';
import Milestones from '../views/Milestones';
import Reports from '../views/Reports';
import ProjectReviews from '../views/ProjectReviews';
import Settings from '../views/Settings';
import CreateProject from '../views/CreateProject';
import ProjectActivity from '../views/ProjectActivity';
import TopCollaborators from '../views/TopCollaborators';

const VIEW_MAP = {
  overview: Overview,
  'my-projects': MyProjects,
  collaborations: Collaborations,
  templates: Templates,
  explore: ExploreProjects,
  saved: SavedProjects,
  funding: Funding,
  milestones: Milestones,
  reports: Reports,
  reviews: ProjectReviews,
  settings: Settings,
  activity: ProjectActivity,
  'top-collaborators': TopCollaborators,
};

function ProjectsCenterRouter({
  activeMenu,
  onMenuSelect,
  overviewProps,
  onCancelCreate,
  actionBarProps,
  createSearchQuery = '',
  collaboratorsSearchQuery = '',
}) {
  if (activeMenu === 'create-project') {
    return <CreateProject onCancel={onCancelCreate} searchQuery={createSearchQuery} />;
  }
  if (activeMenu === 'overview') {
    return (
      <Overview
        {...overviewProps}
        activeMenu={activeMenu}
        onMenuSelect={onMenuSelect}
      />
    );
  }
  const View = VIEW_MAP[activeMenu] || Overview;
  const viewProps = activeMenu === 'top-collaborators' ? { searchQuery: collaboratorsSearchQuery } : {};
  return (
    <div className="ph-view-stack">
      <ProjectsHubActionBar {...actionBarProps} />
      <View {...viewProps} />
    </div>
  );
}

export default memo(ProjectsCenterRouter);
