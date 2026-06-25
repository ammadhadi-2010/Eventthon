import React from 'react';
import JobsBrowseFeed from '../browse/JobsBrowseFeed';

export default function BrowseJobs({ onOpenLeftDrawer = () => {} }) {
  return <JobsBrowseFeed onOpenLeftDrawer={onOpenLeftDrawer} />;
}
