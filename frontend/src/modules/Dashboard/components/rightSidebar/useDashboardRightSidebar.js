import { useCallback, useEffect, useMemo, useState } from 'react';
import API from '../../../../api/axiosConfig';
import { postProfileSocialAction } from '../../../../services/profileOverviewService';
import {
  fetchSuggestedSquadsPreview,
  fetchTrendingProjectsPreview,
} from '../../services/dashboardHubApi';
import { PEOPLE_SUGGESTIONS } from './dashboardRightSidebarData';

function userIdentifier(userData) {
  return String(userData?.email || userData?.mobile || '').trim();
}

export default function useDashboardRightSidebar(userData) {
  const [joinedSquads, setJoinedSquads] = useState({});
  const [connectState, setConnectState] = useState({});
  const [dismissedPeople, setDismissedPeople] = useState({});
  const [eventState, setEventState] = useState({});
  const [trendingProjects, setTrendingProjects] = useState([]);
  const [suggestedSquads, setSuggestedSquads] = useState([]);

  useEffect(() => {
    fetchTrendingProjectsPreview(3).then(setTrendingProjects).catch(() => setTrendingProjects([]));
    fetchSuggestedSquadsPreview(4).then(setSuggestedSquads).catch(() => setSuggestedSquads([]));
  }, []);

  const visiblePeople = useMemo(
    () => PEOPLE_SUGGESTIONS.filter((p) => !dismissedPeople[p.id]),
    [dismissedPeople],
  );

  const toggleSquadJoin = useCallback(async (squadId) => {
    if (joinedSquads[squadId]) return;
    setJoinedSquads((prev) => ({ ...prev, [squadId]: true }));
    try {
      await API.post('/api/squads/join', { squad_id: squadId });
    } catch {
      /* keep optimistic joined state for demo squads */
    }
  }, [joinedSquads]);

  const requestConnect = useCallback(async (personId) => {
    if (connectState[personId] === 'pending') return;
    setConnectState((prev) => ({ ...prev, [personId]: 'pending' }));
    const identifier = userIdentifier(userData);
    if (!identifier || String(personId).startsWith('p-')) return;
    try {
      await postProfileSocialAction(identifier, { action: 'connect', target_user_id: personId });
    } catch {
      /* demo rows stay pending */
    }
  }, [connectState, userData]);

  const dismissPerson = useCallback((personId) => {
    setDismissedPeople((prev) => ({ ...prev, [personId]: true }));
  }, []);

  const registerEvent = useCallback((eventId) => {
    setEventState((prev) => ({ ...prev, [eventId]: 'registered' }));
  }, []);

  return {
    visiblePeople,
    joinedSquads,
    connectState,
    eventState,
    toggleSquadJoin,
    requestConnect,
    dismissPerson,
    registerEvent,
    trendingProjects,
    suggestedSquads,
  };
}
