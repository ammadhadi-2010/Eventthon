import React, { useState } from 'react';
import { useScrollDirection } from '../../../../hooks/useScrollDirection';
import { useMobileHub } from '../../../../hooks/useMobileHub';
import DevProfileOverviewLayout from './DevProfileOverviewLayout';
import HubMobileTopBar from '../../components/mobile/HubMobileTopBar';
import { HUB_MOBILE_SEARCH } from '../../components/mobile/hubMobileSearchPresets';
import '../viewFullProfile/vfph-1.css';
import '../viewFullProfile/vfph-2.css';
import './devProfileOverview.css';
import './devProfileOverview-mobile.css';

/**
 * Profile home: body uses devProfileOverview shell; hero + stats reuse ViewFullProfileHero + buildDraft.
 */
export default function DevProfileOverviewPage({ userData, refreshData }) {
  const isMobile = useMobileHub();
  const scrollDirection = useScrollDirection();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className={`dpo-root${isMobile ? ' dpo-mobile-shell' : ''}`}>
      {isMobile ? (
        <HubMobileTopBar
          scrollDirection={scrollDirection}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          {...HUB_MOBILE_SEARCH.profile}
        />
      ) : null}
      <DevProfileOverviewLayout
        userData={userData}
        refreshData={refreshData}
        searchQuery={searchQuery}
      />
    </div>
  );
}
