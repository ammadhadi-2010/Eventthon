import React from 'react';
import JobsBrowseHero from './JobsBrowseHero';
import JobsBrowseKpiRow from './JobsBrowseKpiRow';
import JobsBrowseJobBoard from './JobsBrowseJobBoard';

const JobsBrowseFeed = ({ onOpenLeftDrawer = () => {} }) => (
  <div className="jobs-center-feed jobs-main-stack">
    <JobsBrowseHero onOpenLeftDrawer={onOpenLeftDrawer} />
    <JobsBrowseKpiRow />
    <JobsBrowseJobBoard />
  </div>
);

export default JobsBrowseFeed;
