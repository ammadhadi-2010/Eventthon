import React from 'react';
import HubMobileTopBar from '../../components/mobile/HubMobileTopBar';
import { HUB_MOBILE_SEARCH } from '../../components/mobile/hubMobileSearchPresets';

export function getProjectsPageShellClasses({ isCreate, isOverview, isMobile, isMobileTopCollab, hideRightRail }) {
  const layoutClass = [
    'ph-layout',
    isCreate ? 'ph-layout--create' : '',
    hideRightRail ? 'ph-layout--no-right' : '',
    isOverview || isMobileTopCollab ? 'ph-mobile-shell__body' : '',
    isCreate && isMobile ? 'ph-mobile-shell__body ph-mobile-shell__body--create' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const pageShellClass = [
    'ph-page',
    isOverview || isMobileTopCollab ? 'ph-mobile-shell' : '',
    isMobileTopCollab ? 'ph-mobile-shell--subpage' : '',
    isCreate && isMobile ? 'ph-mobile-shell ph-mobile-shell--create' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return { layoutClass, pageShellClass };
}

export default function ProjectsHubMobileChrome({
  isOverview,
  isCreate,
  isMobile,
  isMobileTopCollab,
  scrollDirection,
  hubSearchQuery,
  onHubSearchChange,
  createSearchQuery,
  onCreateSearchChange,
  collaboratorsSearchQuery,
  onCollaboratorsSearchChange,
}) {
  return (
    <>
      {isOverview ? (
        <HubMobileTopBar
          scrollDirection={scrollDirection}
          searchQuery={hubSearchQuery}
          onSearchChange={onHubSearchChange}
          searchMode="instant"
          {...HUB_MOBILE_SEARCH.projects}
        />
      ) : null}
      {isCreate && isMobile ? (
        <HubMobileTopBar
          scrollDirection={scrollDirection}
          searchQuery={createSearchQuery}
          onSearchChange={onCreateSearchChange}
          searchMode="instant"
          {...HUB_MOBILE_SEARCH.createProject}
        />
      ) : null}
      {isMobileTopCollab ? (
        <HubMobileTopBar
          scrollDirection={scrollDirection}
          searchQuery={collaboratorsSearchQuery}
          onSearchChange={onCollaboratorsSearchChange}
          searchMode="instant"
          {...HUB_MOBILE_SEARCH.topCollaborators}
        />
      ) : null}
    </>
  );
}
