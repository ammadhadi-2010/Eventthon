import React, { useCallback, useEffect, useState } from 'react';
import ApplicationTrackingDrawer from './components/ApplicationTrackingDrawer';
import JobsCenterRouter from './components/JobsCenterRouter';
import JobsLeftSidebar from './components/JobsLeftSidebar';
import { subscribeHubDrawerToggle } from '../Navbar/hubDrawerBus';
import JobsRightSidebar from './components/JobsRightSidebar';
import { useJobsHub } from './context/JobsHubContext';
import { useJobsHubNavigation } from './hooks/useJobsHubNavigation';
import { isOpportunityType } from './data/opportunityTypes';
import { saveJobsBrowseFilters } from './utils/jobsBrowseSession';
import './styles/JobsDashboard.css';
import './styles/jobs-center-feed.css';
import './styles/jobs-marketplace-premium.css';
import './styles/jobs-hub-shades.css';
import './styles/jobs-hub-views.css';
import './styles/jobs-hub-views-mobile.css';
import './styles/jobs-hub-mobile.css';
import './styles/jh-colorful-mobile.css';
import './styles/jh-hub-rows-mobile.css';
import './styles/jh-hub-rows-mobile-b.css';
import './styles/jh-breadcrumb.css';
import JobsBreadcrumb from './components/JobsBreadcrumb';
import { buildJobsHubCrumbs } from './utils/jobsBreadcrumbs';

function JobsPage({ defaultSection = 'browse' }) {
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
      if (section === 'browse') {
        const clearOpp =
          searchFilters.listingKind === 'opportunity' || isOpportunityType(searchFilters.jobType);
        if (clearOpp) {
          setSearchFilters(
            saveJobsBrowseFilters({
              ...searchFilters,
              listingKind: '',
              jobType: isOpportunityType(searchFilters.jobType) ? '' : searchFilters.jobType,
            }),
          );
        }
      }
      setActiveSection(section);
      setLeftDrawerOpen(false);
    },
    [searchFilters, setActiveSection, setSearchFilters],
  );

  const handleBrowseOpportunity = useCallback(
    (opportunityType) => {
      if (opportunityType === '__clear__') {
        setSearchFilters(
          saveJobsBrowseFilters({
            ...searchFilters,
            listingKind: '',
            jobType: isOpportunityType(searchFilters.jobType) ? '' : searchFilters.jobType,
            company: '',
          }),
        );
        setActiveSection('browse');
        setLeftDrawerOpen(false);
        return;
      }
      setSearchFilters(
        saveJobsBrowseFilters({
          ...searchFilters,
          listingKind: 'opportunity',
          jobType: opportunityType || '',
          workMode: '',
          company: '',
        }),
      );
      setActiveSection('browse');
      setLeftDrawerOpen(false);
    },
    [searchFilters, setActiveSection, setSearchFilters],
  );

  useEffect(() => {
    if (!leftDrawerOpen) return undefined;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [leftDrawerOpen]);

  useEffect(() => subscribeHubDrawerToggle('jobs', openLeftDrawer), [openLeftDrawer]);

  const isBrowse = activeSection === 'browse';

  return (
    <div className={`jobs-page jobs-mobile-shell hub-inner-mobile-shell${isBrowse ? '' : ' jobs-page--subview'}`}>
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
            onBrowseOpportunity={handleBrowseOpportunity}
            searchFilters={searchFilters}
            menuCounts={menuCounts}
          />
        </div>
        <div className="jobs-layout__center">
          <JobsBreadcrumb
            items={buildJobsHubCrumbs(activeSection)}
            className="jh-breadcrumb--compact"
          />
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
