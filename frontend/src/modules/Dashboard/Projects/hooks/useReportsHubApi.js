import { useCallback, useEffect, useState } from 'react';
import { REPORTS_PROGRESS_SEGMENTS, REPORTS_SUMMARY } from '../data/reportsData';
import { fetchReports } from '../services/projectsApi';
import { getProjectsUserId } from '../services/projectsUser';

export default function useReportsHubApi() {
  const [overview, setOverview] = useState({
    kpis: REPORTS_SUMMARY,
    progress_slices: REPORTS_PROGRESS_SEGMENTS,
  });
  const [team, setTeam] = useState({ members: [] });
  const [financials, setFinancials] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const userId = getProjectsUserId();
    if (!userId) return;
    setLoading(true);
    setError('');
    try {
      const data = await fetchReports(userId);
      if (data?.overview) setOverview(data.overview);
      if (data?.team) setTeam(data.team);
      if (data?.financials) setFinancials(data.financials);
    } catch {
      setError('Could not load reports from server. Showing offline analytics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { overview, team, financials, loading, error, reload: load };
}
