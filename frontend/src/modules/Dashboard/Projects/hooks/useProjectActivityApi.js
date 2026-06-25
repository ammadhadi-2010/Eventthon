import { useCallback, useEffect, useState } from 'react';
import {
  ACTIVITY_FEED,
  ACTIVITY_PROJECT_FILTERS,
  ACTIVITY_TABS,
  ACTIVITY_TYPE_FILTERS,
} from '../data/projectActivityData';
import { fetchProjectActivity } from '../services/projectsApi';
import { getProjectsUserId } from '../services/projectsUser';

export default function useProjectActivityApi() {
  const [feed, setFeed] = useState(ACTIVITY_FEED);
  const [projectFilters, setProjectFilters] = useState(ACTIVITY_PROJECT_FILTERS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const userId = getProjectsUserId();
    if (!userId) return;
    setLoading(true);
    setError('');
    try {
      const data = await fetchProjectActivity(userId);
      if (data?.feed?.length) {
        setFeed(data.feed);
        const projects = [{ id: 'all', label: 'All Projects' }, ...(data.projects || [])];
        setProjectFilters(projects);
      }
    } catch {
      setError('Could not load activity from server. Showing offline feed.');
      setFeed(ACTIVITY_FEED);
      setProjectFilters(ACTIVITY_PROJECT_FILTERS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return {
    feed,
    tabs: ACTIVITY_TABS,
    typeFilters: ACTIVITY_TYPE_FILTERS,
    projectFilters,
    loading,
    error,
    reload: load,
  };
}
