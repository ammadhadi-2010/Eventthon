import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useScrollDirection } from '../../../hooks/useScrollDirection';
import GigsLeftSidebar from './components/GigsLeftSidebar';
import GigsMainContent from './components/GigsMainContent';
import GigsHubLayout from './components/GigsHubLayout';
import GigsHubRightRail from './components/GigsHubRightRail';
import MyGigsContent from './components/MyGigsContent';
import OrdersContent from './components/OrdersContent';
import CreateGigContent from './components/CreateGigContent';
import SavedGigsContent from './components/SavedGigsContent';
import ReviewsContent from './components/ReviewsContent';
import ProposalsContent from './components/ProposalsContent';
import GigsSectionPlaceholder from './components/GigsSectionPlaceholder';
import useGigsHubSearch from './hooks/useGigsHubSearch';
import './styles/gigs-hub-back-btn.css';
import './styles/GigsDashboard.css';
import './styles/gigs-hub-shell.css';
import './styles/gigs-hub-rail.css';
import './styles/gigs-hub-center.css';
import './styles/gigs-hub-mobile.css';
import './components/gigs-create-gig-mobile.css';

const TAB_PANEL_SECTIONS = new Set([
  'My Gigs', 'Orders', 'Saved Gigs', 'Reviews', 'Proposals', 'Create Gig', 'Earnings', 'Settings',
]);

const GigsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const scrollDirection = useScrollDirection();
  const hub = useGigsHubSearch();
  const [activeSection, setActiveSection] = useState('Browse Gigs');
  const [ordersSpotlightId, setOrdersSpotlightId] = useState('');
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const clearOrdersSpotlight = useCallback(() => setOrdersSpotlightId(''), []);
  const openLeftDrawer = useCallback(() => setLeftDrawerOpen(true), []);
  const closeLeftDrawer = useCallback(() => setLeftDrawerOpen(false), []);

  useEffect(() => {
    if (!leftDrawerOpen) return undefined;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [leftDrawerOpen]);

  const handleSectionSelect = useCallback((section) => {
    setActiveSection(section);
    setLeftDrawerOpen(false);
  }, []);

  useEffect(() => {
    const incoming = location.state;
    if (!incoming || typeof incoming !== 'object') return;
    if (incoming.gigsSection) setActiveSection(String(incoming.gigsSection));
    else if (incoming.gigOrderId) setActiveSection('Orders');
    if (incoming.gigOrderId) setOrdersSpotlightId(String(incoming.gigOrderId));
    if (incoming.gigsSection || incoming.gigOrderId) {
      navigate('.', { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  const openMyGigs = useCallback(() => setActiveSection('My Gigs'), []);
  const openOrders = useCallback(() => setActiveSection('Orders'), []);
  const onBackToBrowse = useCallback(() => setActiveSection('Browse Gigs'), []);

  const isMyGigs = activeSection === 'My Gigs';
  const isOrders = activeSection === 'Orders';
  const isCreateGig = activeSection === 'Create Gig';
  const isSavedGigs = activeSection === 'Saved Gigs';
  const isReviews = activeSection === 'Reviews';
  const isProposals = activeSection === 'Proposals';
  const isEarnings = activeSection === 'Earnings';
  const isSettings = activeSection === 'Settings';

  const centerContent = isMyGigs ? (
    <MyGigsContent onOpenCreateGig={() => setActiveSection('Create Gig')} onBack={onBackToBrowse} />
  ) : isOrders ? (
    <OrdersContent
      spotlightOrderId={ordersSpotlightId}
      onConsumedSpotlight={clearOrdersSpotlight}
      onBack={onBackToBrowse}
    />
  ) : isCreateGig ? (
    <CreateGigContent onNavigateBack={onBackToBrowse} />
  ) : isSavedGigs ? (
    <SavedGigsContent onBack={onBackToBrowse} />
  ) : isReviews ? (
    <ReviewsContent onBack={onBackToBrowse} />
  ) : isProposals ? (
    <ProposalsContent onBack={onBackToBrowse} />
  ) : isEarnings ? (
    <GigsSectionPlaceholder
      title="Earnings"
      subtitle="Track payouts and revenue from your gigs."
      onBack={onBackToBrowse}
    />
  ) : isSettings ? (
    <GigsSectionPlaceholder
      title="Settings"
      subtitle="Manage gig hub preferences and notifications."
      onBack={onBackToBrowse}
    />
  ) : (
    <GigsMainContent
      hub={hub}
      activeSection={activeSection}
      onSectionSelect={handleSectionSelect}
      onCreateGig={() => setActiveSection('Create Gig')}
      onGoToMyGigs={openMyGigs}
      onOpenOrders={openOrders}
    />
  );

  const isBrowseGigs = activeSection === 'Browse Gigs';
  const mobileSearch = useMemo(
    () =>
      isBrowseGigs
        ? {
            searchTerm: hub.searchTerm,
            onSearchTermChange: hub.setSearchTerm,
            onSearch: hub.runHubSearch,
          }
        : null,
    [hub.runHubSearch, hub.searchTerm, hub.setSearchTerm, isBrowseGigs],
  );

  const centerClass = [
    TAB_PANEL_SECTIONS.has(activeSection) ? 'gigs-hub-center-panel--tab' : '',
    isCreateGig ? 'gigs-hub-center-panel--create-wizard' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <GigsHubLayout
      hideRightRail={isCreateGig}
      scrollDirection={scrollDirection}
      leftDrawerOpen={leftDrawerOpen}
      onOpenLeftDrawer={openLeftDrawer}
      onCloseLeftDrawer={closeLeftDrawer}
      mobileSearch={mobileSearch}
      leftRail={<GigsLeftSidebar activeSection={activeSection} onSectionSelect={handleSectionSelect} />}
      center={
        <div className={`gigs-hub-center-panel__inner${centerClass ? ` ${centerClass}` : ''}`}>
          {centerContent}
        </div>
      }
      rightRail={
        isCreateGig ? null : (
          <GigsHubRightRail
            activeSection={activeSection}
            onGoToMyGigs={openMyGigs}
            onOpenOrders={openOrders}
          />
        )
      }
    />
  );
};

export default GigsPage;
