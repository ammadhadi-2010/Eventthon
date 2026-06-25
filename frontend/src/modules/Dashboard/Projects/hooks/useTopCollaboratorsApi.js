import { useCallback, useEffect, useState } from 'react';
import {
  COLLABORATOR_PERIOD_FILTERS,
  COLLABORATOR_TABS,
  TOP_COLLABORATORS_FEED,
} from '../data/topCollaboratorsData';
import { fetchTopCollaborators } from '../services/projectsApi';
import { getProjectsUserId } from '../services/projectsUser';

export default function useTopCollaboratorsApi() {
  const [rows, setRows] = useState(TOP_COLLABORATORS_FEED);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const userId = getProjectsUserId();
    if (!userId) return;
    setLoading(true);
    setError('');
    try {
      const data = await fetchTopCollaborators(userId);
      if (data?.collaborators?.length) setRows(data.collaborators);
    } catch {
      setError('Could not load collaborators from server. Showing offline list.');
      setRows(TOP_COLLABORATORS_FEED);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return {
    rows,
    tabs: COLLABORATOR_TABS,
    periodFilters: COLLABORATOR_PERIOD_FILTERS,
    loading,
    error,
    reload: load,
  };
}
