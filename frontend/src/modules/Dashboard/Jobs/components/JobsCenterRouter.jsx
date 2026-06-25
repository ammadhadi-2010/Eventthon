import React, { memo } from 'react';
import BrowseJobs from '../views/BrowseJobs';
import MyApplications from '../views/MyApplications';
import SavedJobs from '../views/SavedJobs';
import JobAlerts from '../views/JobAlerts';
import RecommendedJobs from '../views/RecommendedJobs';
import Companies from '../views/Companies';
import JobsSettings from '../views/JobsSettings';
import JobsComingSoon from '../views/JobsComingSoon';
import { isJobsComingSoonSection } from '../data/jobsMenuData';

const VIEW_MAP = {
  browse: BrowseJobs,
  applications: MyApplications,
  saved: SavedJobs,
  alerts: JobAlerts,
  recommended: RecommendedJobs,
  companies: Companies,
  settings: JobsSettings,
};

function JobsCenterRouter({ activeSection, onOpenLeftDrawer = () => {} }) {
  if (isJobsComingSoonSection(activeSection)) {
    return <JobsComingSoon sectionId={activeSection} />;
  }
  if (activeSection === 'browse') {
    return <BrowseJobs onOpenLeftDrawer={onOpenLeftDrawer} />;
  }
  const View = VIEW_MAP[activeSection] || BrowseJobs;
  return <View />;
}

export default memo(JobsCenterRouter);
