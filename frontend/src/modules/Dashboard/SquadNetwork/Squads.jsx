import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SquadList from './components/SquadList';
import SquadChat from './components/tabs/SquadChat/SquadChat';
import SquadOverview from './components/SquadOverview';
import CreateSquadPanel from './components/createSquad/CreateSquadPanel';
import HubMobileTopBar from '../components/mobile/HubMobileTopBar';
import { HUB_MOBILE_SEARCH } from '../components/mobile/hubMobileSearchPresets';
import useSquadHubMobileScroll from './hooks/useSquadHubMobileScroll';
import './styles/squad-hub.css';
import './styles/squad-hub-mobile.css';
import './styles/squad-hub-mobile-chrome.css';
import './styles/squad-hub-mobile-tooltips.css';

const LAST_SQUAD_KEY = 'et:lastSquadId';

const Squads = ({ userData }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isHeaderVisible } = useSquadHubMobileScroll();
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

  useEffect(() => {
    const navState = location.state;
    if (!navState?.squadProjectsRefresh) return;
    if (navState.openTab) setCenterTab(navState.openTab);
    setProjectsRefreshToken((prev) => prev + 1);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    const squadId = selectedSquad?._id;
    if (!squadId) {
      prevSquadIdRef.current = null;
      return;
    }
    if (prevSquadIdRef.current !== squadId) {
      setCenterTab('Overview');
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

  return (
    <div
      className={`squad-hub squad-hub-mobile-shell${showCreatePanel ? ' squad-hub--creating' : ''}${
        mobileListOpen ? ' squad-hub--list-open' : ''
      }`}
    >
      <HubMobileTopBar
        isHeaderVisible={isHeaderVisible}
        searchQuery={squadSearchQuery}
        onSearchQueryChange={setSquadSearchQuery}
        {...HUB_MOBILE_SEARCH.squads}
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
        <div className="squad-hub__workspace">
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

          <SquadOverview
            selectedSquad={selectedSquad}
            members={hubMetrics?.membersList || selectedSquad?.members || []}
            hubMetrics={hubMetrics}
            activityOverview={hubMetrics?.activityOverview || []}
            onQuickAction={(action) => {
              if (action === 'project') setCenterTab('Projects');
              if (action === 'poll') setCenterTab('Activity');
              if (action === 'upload') setCenterTab('Files');
              if (action === 'meeting') setCenterTab('Settings');
              if (action === 'chat') setCenterTab('Chat');
              if (action === 'overview') setCenterTab('Overview');
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Squads;
