import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './dashboardMainLayout.css';
import './components/mobile/dashboard-mobile-layout.css';
import './components/mobile/dashboard-home-mobile.css';

import HomeLeftSidebar from './components/HomeLeftSidebar';
import { subscribeHubDrawerToggle } from './Navbar/hubDrawerBus';
import UpdatesCarousel from './Updates/UpdatesCarousel';
import PostSystem from './components/PostSystem/PostSystem';
import ActivityFeed from './components/FeedSystem/ActivityFeed';
import DashboardRightSidebar from './components/rightSidebar/DashboardRightSidebar';
import useDashboardRightSidebar from './components/rightSidebar/useDashboardRightSidebar';
import MobileFeedSuggestedSquadsCarousel from './components/mobile/MobileFeedSuggestedSquadsCarousel';
import MobileFeedPeopleCarousel from './components/mobile/MobileFeedPeopleCarousel';
import { fetchHomeTimelineFeed } from './components/FeedSystem/homeFeedQuery';
import { readStoredUserStub, persistUserSession, hasStoredSession } from '../../utils/storedUser';
import { useLiveProfileCard } from './hooks/useLiveProfileCard';
import { useDashboardShell } from './context/dashboardShellContext';
import GuestWelcomeBanner from './components/GuestWelcomeBanner';
import SupportCauseFeedCard from '../Donation/components/SupportCauseFeedCard';
import { fetchPublicDonationConfig } from '../Donation/donationApi';
import { mergeDonationSettings } from '../Donation/donationContent';
import AboutJourneyFeedCard from '../FooterPages/components/AboutJourneyFeedCard';
import useAboutFeedContent from '../FooterPages/hooks/useAboutFeedContent';
import './components/growth/growth-ui.css';
import '../Donation/styles/donation.css';
import '../FooterPages/styles/about-us.css';

const MainDashboard = ({ userData }) => {
  const { mobileLeftDrawerOpen, setMobileLeftDrawerOpen, toggleMobileLeftDrawer } = useDashboardShell();
  const [posts, setPosts] = useState([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [donationFeedEnabled, setDonationFeedEnabled] = useState(true);
  const [donationFeedSettings, setDonationFeedSettings] = useState(null);
  const aboutFeedPage = useAboutFeedContent();

  const liveProfile = useLiveProfileCard(userData);
  const effectiveUser = useMemo(() => {
    const stub = readStoredUserStub();
    if (!liveProfile) return stub;
    return { ...stub, ...liveProfile };
  }, [liveProfile]);

  const sidebar = useDashboardRightSidebar(effectiveUser);
  const isGuest = !hasStoredSession();

  const fetchAllPosts = useCallback(async () => {
    setFeedLoading(true);
    try {
      const mergedFeed = await fetchHomeTimelineFeed();
      setPosts(Array.isArray(mergedFeed) ? mergedFeed : []);
    } catch (err) {
      console.error('Home timeline feed failed:', err);
      setPosts([]);
    } finally {
      setFeedLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllPosts();
  }, [fetchAllPosts]);

  useEffect(() => {
    fetchPublicDonationConfig()
      .then((data) => {
        const settings = mergeDonationSettings(data?.settings);
        setDonationFeedEnabled(Boolean(settings.feedCardEnabled ?? true));
        setDonationFeedSettings(settings);
      })
      .catch(() => {
        setDonationFeedEnabled(true);
        setDonationFeedSettings(null);
      });
  }, []);

  useEffect(() => subscribeHubDrawerToggle('home', () => toggleMobileLeftDrawer?.()), [toggleMobileLeftDrawer]);

  useEffect(() => {
    const closeOnDesktop = () => {
      if (window.innerWidth >= 1024) setMobileLeftDrawerOpen(false);
    };
    window.addEventListener('resize', closeOnDesktop);
    return () => window.removeEventListener('resize', closeOnDesktop);
  }, [setMobileLeftDrawerOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileLeftDrawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileLeftDrawerOpen]);

  const safePosts = Array.isArray(posts) ? posts : [];
  const closeLeftDrawer = () => setMobileLeftDrawerOpen(false);

  const mobileWidgets = {
    suggestedSquads: (
      <MobileFeedSuggestedSquadsCarousel
        squads={sidebar.suggestedSquads}
        joinedSquads={sidebar.joinedSquads}
        onJoinSquad={sidebar.toggleSquadJoin}
      />
    ),
    peopleYouMayKnow: (
      <MobileFeedPeopleCarousel
        people={sidebar.visiblePeople}
        connectState={sidebar.connectState}
        onConnect={sidebar.requestConnect}
      />
    ),
    supportCause: donationFeedEnabled ? (
      <SupportCauseFeedCard
        title={donationFeedSettings?.feedCardTitle}
        subtitle={donationFeedSettings?.feedCardSubtitle}
      />
    ) : null,
    aboutJourney: aboutFeedPage?.feedJourneyEnabled && aboutFeedPage?.timeline?.length ? (
      <AboutJourneyFeedCard steps={aboutFeedPage.timeline} subtitle={aboutFeedPage.subtitle} />
    ) : null,
  };

  const aboutFeed = aboutFeedPage
    ? {
        journeyEnabled: aboutFeedPage.feedJourneyEnabled,
        timeline: aboutFeedPage.timeline,
      }
    : null;

  return (
    <div className="dash-home-shell dash-home-mobile-shell hub-inner-mobile-shell">
      <div
        className={`dash-left-rail-backdrop${mobileLeftDrawerOpen ? ' dash-left-rail-backdrop--visible' : ''}`}
        onClick={closeLeftDrawer}
        role="presentation"
        aria-hidden={!mobileLeftDrawerOpen}
      />

      <aside
        id="dash-mobile-left-drawer"
        className={`dash-mobile-drawer-layer dash-home-mobile-drawer-layer${mobileLeftDrawerOpen ? ' dash-mobile-drawer-layer--open' : ''}`}
        aria-label="Mobile wallet and quick links drawer"
        aria-hidden={!mobileLeftDrawerOpen}
      >
        <div className="dash-left-rail-inner">
          <button type="button" className="dash-left-rail-close" onClick={closeLeftDrawer}>
            Close Panel
          </button>
          <HomeLeftSidebar userData={effectiveUser} drawerMode />
        </div>
      </aside>

      <div className="dash-main-grid">
        <aside className="dash-left-rail dash-left-rail--desktop-only" aria-label="Profile and wallet sidebar">
          <div className="dash-left-rail-inner">
            <HomeLeftSidebar userData={effectiveUser} />
          </div>
        </aside>

        <main className="dash-center-feed">
          {isGuest ? <GuestWelcomeBanner /> : null}
          <UpdatesCarousel />
          <PostSystem
            userData={effectiveUser}
            onPostCreated={fetchAllPosts}
            aiHighlightComposerEnabled
          />
          {feedLoading && safePosts.length === 0 ? <p className="dash-feed-hint">Updating Feed...</p> : null}
          <ActivityFeed
            userData={effectiveUser}
            posts={safePosts}
            mobileWidgets={mobileWidgets}
            aboutFeed={aboutFeed}
            onItemDeleted={(id) => {
              setPosts((prev) => (Array.isArray(prev) ? prev : []).filter((p) => String(p?._id) !== String(id)));
              fetchAllPosts();
            }}
          />
          {feedLoading && safePosts.length > 0 ? <p className="dash-feed-hint">Refreshing feed...</p> : null}
        </main>

        <aside className="dash-right-rail dash-right-rail--desktop-only" aria-label="Recommendations sidebar">
          <div className="dash-right-rail-inner">
            <DashboardRightSidebar userData={effectiveUser} />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default MainDashboard;
