import React, { useCallback, useEffect, useState } from 'react';
import { useScrollDirection } from '../../../hooks/useScrollDirection';
import ApplicationTrackingDrawer from './components/ApplicationTrackingDrawer';
import JobsCenterRouter from './components/JobsCenterRouter';
import JobsLeftSidebar from './components/JobsLeftSidebar';
import HubMobileTopBar from '../components/mobile/HubMobileTopBar';
import { HUB_MOBILE_SEARCH } from '../components/mobile/hubMobileSearchPresets';
import JobsRightSidebar from './components/JobsRightSidebar';
import { useJobsHub } from './context/JobsHubContext';
import { useJobsHubNavigation } from './hooks/useJobsHubNavigation';
import { saveJobsBrowseFilters } from './utils/jobsBrowseSession';
import './styles/JobsDashboard.css';
import './styles/jobs-center-feed.css';
import './styles/jobs-marketplace-premium.css';
import './styles/jobs-hub-views.css';
import './styles/jobs-hub-views-mobile.css';
import './styles/jobs-hub-mobile.css';

function JobsPage({ defaultSection = 'browse' }) {
  const scrollDirection = useScrollDirection();
  const { activeSection, setActiveSection } = useJobsHubNavigation(defaultSection);
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const {
    menuCounts,
    selectedApplication,
    setSelectedApplicationId,
    advanceApplication,
    searchFilters,
    setSearchFilters,
  } = useJobsHub();

  const openLeftDrawer = useCallback(() => setLeftDrawerOpen(true), []);
  const closeLeftDrawer = useCallback(() => setLeftDrawerOpen(false), []);

  const handleSectionSelect = useCallback(
    (section) => {
      setActiveSection(section);
      setLeftDrawerOpen(false);
    },
    [setActiveSection],
  );

  useEffect(() => {
    if (!leftDrawerOpen) return undefined;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [leftDrawerOpen]);

  const handleJobsSearch = useCallback(
    (q) => {
      const next = saveJobsBrowseFilters({ q });
      setSearchFilters(next);
    },
    [setSearchFilters],
  );

  const isBrowse = activeSection === 'browse';

  return (
    <div className={`jobs-page jobs-mobile-shell${isBrowse ? '' : ' jobs-page--subview'}`}>
      {isBrowse ? (
        <HubMobileTopBar
          scrollDirection={scrollDirection}
          searchQuery={searchFilters.q || ''}
          onSearchChange={handleJobsSearch}
          onAvatarClick={openLeftDrawer}
          avatarAriaLabel="Open jobs menu"
          {...HUB_MOBILE_SEARCH.jobs}
        />
      ) : null}
      {leftDrawerOpen ? (
        <button
          type="button"
          className="jobs-left-drawer-backdrop is-visible"
          aria-label="Close jobs menu"
          onClick={closeLeftDrawer}
        />
      ) : null}
      <div className={`jobs-layout jobs-mobile-shell__body${leftDrawerOpen ? ' jobs-layout--left-open' : ''}`}>
        <div className={`jobs-layout__rail jobs-layout__rail--left${leftDrawerOpen ? ' is-drawer-open' : ''}`}>
          <JobsLeftSidebar
            activeSection={activeSection}
            onSectionSelect={handleSectionSelect}
            menuCounts={menuCounts}
          />
        </div>
        <div className="jobs-layout__center">
          <JobsCenterRouter activeSection={activeSection} onOpenLeftDrawer={openLeftDrawer} />
        </div>
        <div className="jobs-layout__rail jobs-layout__rail--right">
          <JobsRightSidebar activeSection={activeSection} />
        </div>
      </div>

      {activeSection === 'applications' && selectedApplication ? (
        <ApplicationTrackingDrawer
          application={selectedApplication}
          onClose={() => setSelectedApplicationId(null)}
          onAdvanceStatus={advanceApplication}
        />
      ) : null}
    </div>
  );
}

export default JobsPage;
