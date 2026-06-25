import React from 'react';
import GigsBrowseStatsSection from './GigsBrowseStatsSection';
import GigsBrowseFeaturedSection from './GigsBrowseFeaturedSection';

/** Hub middle stack: stats row then featured gigs grid. */
const GigCenterBrowseStack = () => (
  <>
    <GigsBrowseStatsSection />
    <GigsBrowseFeaturedSection />
  </>
);

export default GigCenterBrowseStack;
