import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SquadList from './components/SquadList';
import SquadChat from './components/tabs/SquadChat/SquadChat';
import SquadOverview from './components/SquadOverview';
import SquadHubMobileBreadcrumb from './components/SquadHubMobileBreadcrumb';
import CreateSquadPanel from './components/createSquad/CreateSquadPanel';
import { subscribeHubDrawerToggle } from '../Navbar/hubDrawerBus';
import { refreshScrollHideRoots } from '../../Admin/hooks/useScrollHideNavbar';
import './styles/squad-hub.css';
import './styles/squad-hub-mobile.css';
import './styles/squad-hub-mobile-chrome.css';
import './styles/squad-hub-mobile-tooltips.css';

const LAST_SQUAD_KEY = 'et:lastSquadId';
const HUB_TABS = ['Overview', 'Chat', 'Projects', 'Members', 'Activity', 'Files', 'Settings'];

function normalizeHubTab(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const normalized = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
  return HUB_TABS.includes(normalized) ? normalized : '';
}

const Squads = ({ userData }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedSquad, setSelectedSquad] = useState(null);
  const [activeTab, setActiveTab] = useState('All Squads');
  const [centerTab, setCenterTab] = useState('Overview');
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [editingSquad, setEditingSquad] = useState(null);
  const [squadRefreshToken, setSquadRefreshToken] = useState(0);
  const [projectsRefreshToken, setProjectsRefreshToken] = useState(0);
  const [hubMetrics, setHubMetrics] = useState(null);
  const [mobileListOpen, setMobileListOpen] = useState(false);
  const [squadSearchQuery, setSquadSearchQuery] = useState('');
  const prevSquadIdRef = useRef(null);
  const pendingTabRef = useRef('');

  useEffect(() => {
    const params = new URLSearchParams(location.search || '');
    const tabFromQuery = normalizeHubTab(params.get('tab') || params.get('openTab'));
    const focusSquadId = params.get('squad') || params.get('join') || '';
    let changed = false;
    if (tabFromQuery) {
      pendingTabRef.current = tabFromQuery;
      setCenterTab(tabFromQuery);
      params.delete('tab');
      params.delete('openTab');
      changed = true;
    }
    if (focusSquadId) {
      try {
        sessionStorage.setItem(LAST_SQUAD_KEY, String(focusSquadId));
      } catch {
        /* ignore */
      }
      if (params.get('join') || params.get('squad')) {
        setActiveTab('Invites');
      }
      params.delete('squad');
      params.delete('join');
      changed = true;
    }
    if (!changed) return;
    const nextSearch = params.toString();
    navigate(
      { pathname: location.pathname, search: nextSearch ? `?${nextSearch}` : '' },
      { replace: true, state: location.state },
    );
  }, [location.search, location.pathname, location.state, navigate]);

  useEffect(() => {
    const navState = location.state;
    if (!navState) return;
    const tabFromState = normalizeHubTab(navState.openTab);
    if (tabFromState) {
      pendingTabRef.current = tabFromState;
      setCenterTab(tabFromState);
    }
    if (!navState.squadProjectsRefresh && !tabFromState) return;
    if (navState.squadProjectsRefresh) {
      setProjectsRefreshToken((prev) => prev + 1);
    }
    navigate(location.pathname, { replace: true, state: null });
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    const squadId = selectedSquad?._id;
    if (!squadId) {
      prevSquadIdRef.current = null;
      return;
    }
    if (prevSquadIdRef.current !== squadId) {
      const pending = pendingTabRef.current;
      pendingTabRef.current = '';
      setCenterTab(pending || 'Overview');
      setHubMetrics(null);
      prevSquadIdRef.current = squadId;
      try {
        sessionStorage.setItem(LAST_SQUAD_KEY, String(squadId));
      } catch {
        /* ignore */
      }
    }
  }, [selectedSquad?._id]);

  const openEditSquad = (squad) => {
    const target = squad || selectedSquad;
    if (!target?._id) return;
    setEditingSquad(target);
    setShowCreatePanel(true);
  };

  const handleCreated = (squad, draft, isEdit = false) => {
    if (draft) return;
    if (squad) {
      setSelectedSquad(squad);
      if (!isEdit) setCenterTab('Overview');
    }
    setShowCreatePanel(false);
    setEditingSquad(null);
    setSquadRefreshToken((prev) => prev + 1);
  };

  const handleSelectSquad = useCallback((squad) => {
    setSelectedSquad(squad);
    setMobileListOpen(false);
  }, []);

  useEffect(() => subscribeHubDrawerToggle('squads', () => setMobileListOpen(true)), []);

  useEffect(() => {
    refreshScrollHideRoots();
    const timer = window.setTimeout(refreshScrollHideRoots, 400);
    return () => window.clearTimeout(timer);
  }, [selectedSquad?._id, centerTab]);

  return (
    <div
      className={`squad-hub squad-hub-mobile-shell hub-inner-mobile-shell${showCreatePanel ? ' squad-hub--creating' : ''}${
        mobileListOpen ? ' squad-hub--list-open' : ''
      }`}
    >
      <SquadHubMobileBreadcrumb
        squadName={selectedSquad?.squad_name || ''}
        activeTab={centerTab}
      />

      {mobileListOpen ? (
        <button
          type="button"
          className="squad-hub__list-backdrop"
          aria-label="Close squads menu"
          onClick={() => setMobileListOpen(false)}
        />
      ) : null}

      <SquadList
        userData={userData}
        selectedSquad={selectedSquad}
        onSelectSquad={handleSelectSquad}
        onEditSquad={openEditSquad}
        onSquadUpdated={setSelectedSquad}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onCreateSquad={() => {
          setEditingSquad(null);
          setShowCreatePanel(true);
        }}
        refreshToken={squadRefreshToken}
        searchQuery={squadSearchQuery}
        onSearchQueryChange={setSquadSearchQuery}
        lastSquadIdKey={LAST_SQUAD_KEY}
        onOpenInviteSquad={(squad) => {
          if (squad) setSelectedSquad(squad);
          pendingTabRef.current = 'Chat';
          setCenterTab('Chat');
          setActiveTab('My Squads');
          setSquadRefreshToken((n) => n + 1);
        }}
      />

      {showCreatePanel ? (
        <CreateSquadPanel
          userData={userData}
          editingSquad={editingSquad}
          onClose={() => {
            setShowCreatePanel(false);
            setEditingSquad(null);
          }}
          onCreated={handleCreated}
        />
      ) : (
        <div
          className={`squad-hub__workspace${centerTab === 'Chat' ? ' squad-hub__workspace--chat-full' : ''}`}
        >
          <SquadChat
            selectedSquad={selectedSquad}
            userData={userData}
            activeTab={centerTab}
            onTabChange={setCenterTab}
            projectsRefreshToken={projectsRefreshToken}
            onHubMetrics={setHubMetrics}
            onEditSquad={() => openEditSquad()}
            onOpenSettings={() => setCenterTab('Settings')}
            onToggleMobileList={() => setMobileListOpen((open) => !open)}
            onMobileBack={() => setMobileListOpen(true)}
          />

          {centerTab !== 'Chat' ? (
            <SquadOverview
              selectedSquad={selectedSquad}
              members={hubMetrics?.membersList || selectedSquad?.members || []}
              hubMetrics={hubMetrics}
              activityOverview={hubMetrics?.activityOverview || []}
              onTabChange={setCenterTab}
              onQuickAction={(action) => {
                if (action === 'project') setCenterTab('Projects');
                if (action === 'poll') setCenterTab('Activity');
                if (action === 'upload') setCenterTab('Files');
                if (action === 'meeting') setCenterTab('Settings');
                if (action === 'chat') setCenterTab('Chat');
                if (action === 'overview') setCenterTab('Overview');
              }}
            />
          ) : null}
        </div>
      )}
    </div>
  );
};

export default Squads;
