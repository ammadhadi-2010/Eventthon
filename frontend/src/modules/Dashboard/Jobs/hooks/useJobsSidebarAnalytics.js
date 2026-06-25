import { useCallback, useEffect, useState } from 'react';
import { fetchJobsSidebarAnalytics } from '../services/jobsHubApi';

const EMPTY_MARKET = {
  openingsLabel: '0',
  averageSalary: '$0k',
  salaryProgressPercent: 0,
  topSkills: [],
};

export function useJobsSidebarAnalytics(refreshKey = 0) {
  const [market, setMarket] = useState(EMPTY_MARKET);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchJobsSidebarAnalytics();
      setMarket(data.market || EMPTY_MARKET);
      setActivity(Array.isArray(data.activity) ? data.activity : []);
    } catch {
      setMarket(EMPTY_MARKET);
      setActivity([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  return { market, activity, loading, reload: load };
}
