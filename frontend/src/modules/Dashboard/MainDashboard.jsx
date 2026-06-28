import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './dashboardMainLayout.css';
import './components/mobile/dashboard-mobile-layout.css';
import './components/mobile/dashboard-home-mobile.css';

import HomeLeftSidebar from './components/HomeLeftSidebar';
import HubMobileTopBar from './components/mobile/HubMobileTopBar';
import { HUB_MOBILE_SEARCH } from './components/mobile/hubMobileSearchPresets';
import UpdatesCarousel from './Updates/UpdatesCarousel';
import PostSystem from './components/PostSystem/PostSystem';
import ActivityFeed from './components/FeedSystem/ActivityFeed';
import DashboardRightSidebar from './components/rightSidebar/DashboardRightSidebar';
import useDashboardRightSidebar from './components/rightSidebar/useDashboardRightSidebar';
import MobileFeedSuggestedSquadsCarousel from './components/mobile/MobileFeedSuggestedSquadsCarousel';
import MobileFeedPeopleCarousel from './components/mobile/MobileFeedPeopleCarousel';
import { fetchHomeTimelineFeed } from './components/FeedSystem/homeFeedQuery';
import { readStoredUserStub, hasStoredSession } from '../../utils/storedUser';
import GuestLoginPromptModal from '../../components/GuestLoginPromptModal';
import { useDashboardShell } from './context/dashboardShellContext';

const GUEST_LOGIN_PROMPT_MS = 40000;

const MainDashboard = ({ userData }) => {
  const { mobileLeftDrawerOpen, setMobileLeftDrawerOpen } = useDashboardShell();
  const [posts, setPosts] = useState([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastHomeScrollY, setLastHomeScrollY] = useState(0);
  const [homeSearchQuery, setHomeSearchQuery] = useState('');
  const [guestPromptOpen, setGuestPromptOpen] = useState(false);
  const isGuest = !hasStoredSession();

  const effectiveUser = useMemo(() => {
    const stub = readStoredUserStub();
    if (!userData) return stub;
    return { ...stub, ...userData };
  }, [userData]);

  const sidebar = useDashboardRightSidebar(effectiveUser);

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
    if (!isGuest) return undefined;
    const interval = window.setInterval(() => {
      setGuestPromptOpen(true);
    }, GUEST_LOGIN_PROMPT_MS);
    return () => window.clearInterval(interval);
  }, [isGuest]);

  useEffect(() => {
    const mobile = window.matchMedia('(max-width: 1023px)');
    if (!mobile.matches) return undefined;

    const scrollRoot = document.querySelector('main.et-main-scroll') || window;
    const getScrollY = () => (scrollRoot === window ? window.scrollY : scrollRoot.scrollTop);

    const handleHomeScroll = () => {
      const currentScroll = getScrollY();
      if (currentScroll > lastHomeScrollY && currentScroll > 50) {
        setIsHeaderVisible(false);
      } else {
        setIsHeaderVisible(true);
      }
      setLastHomeScrollY(currentScroll);
    };

    scrollRoot.addEventListener('scroll', handleHomeScroll, { passive: true });
    return () => scrollRoot.removeEventListener('scroll', handleHomeScroll);
  }, [lastHomeScrollY]);

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
  const promptGuestLogin = useCallback(() => setGuestPromptOpen(true), []);

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
  };

  return (
    <div className="dash-home-shell dash-home-mobile-shell">
      <GuestLoginPromptModal
        open={isGuest && guestPromptOpen}
        onKeepBrowsing={() => setGuestPromptOpen(false)}
      />
      <HubMobileTopBar
        isVisible={isHeaderVisible}
        avatarAction="leftDrawer"
        avatarAriaLabel="Open menu"
        searchQuery={homeSearchQuery}
        onSearchQueryChange={setHomeSearchQuery}
        {...HUB_MOBILE_SEARCH.home}
      />

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
          <UpdatesCarousel />
          <PostSystem
            userData={effectiveUser}
            onPostCreated={fetchAllPosts}
            aiHighlightComposerEnabled
            onRequireAuth={isGuest ? promptGuestLogin : undefined}
          />
          {feedLoading && safePosts.length === 0 ? <p className="dash-feed-hint">Updating Feed...</p> : null}
          <ActivityFeed
            userData={effectiveUser}
            posts={safePosts}
            mobileWidgets={mobileWidgets}
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
