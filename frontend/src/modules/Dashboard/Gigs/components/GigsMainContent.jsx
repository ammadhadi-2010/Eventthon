import React from 'react';
import GigCenterBrowseStack from '../gigCenter/GigCenterBrowseStack';
import GigsBrowseHeroCard from './GigsBrowseHeroCard';
import GigsBrowseHubResultsSection from './GigsBrowseHubResultsSection';
import GigsHubMobileInsights from './GigsHubMobileInsights';

const GigsMainContent = ({ hub, onCreateGig, onGoToMyGigs, onOpenOrders }) => (
  <section className="gigs-main-stack">
    <GigsBrowseHeroCard
      searchTerm={hub.searchTerm}
      onSearchTermChange={hub.setSearchTerm}
      onSearch={hub.runHubSearch}
      onFiltersApplied={hub.refreshWithFilters}
      onCreateGig={onCreateGig}
    />
    <GigCenterBrowseStack />
    <GigsBrowseHubResultsSection
      hasSearched={hub.hasSearched}
      searching={hub.searching}
      rows={hub.rows}
      total={hub.total}
      searchTerm={hub.searchTerm}
    />
    <GigsHubMobileInsights onGoToMyGigs={onGoToMyGigs} onOpenOrders={onOpenOrders} />
  </section>
);

export default GigsMainContent;
