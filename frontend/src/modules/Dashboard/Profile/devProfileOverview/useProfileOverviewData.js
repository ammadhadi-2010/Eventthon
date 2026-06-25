import { useCallback, useEffect, useState } from 'react';
import { fetchProfileOverviewData } from '../services/profileOverviewService';
import { getProfileIdentifier } from '../utils/profileSession';

export function useProfileOverviewData(userData) {
  const identifier = getProfileIdentifier(userData);
  const [bundle, setBundle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (!identifier) {
      setBundle(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProfileOverviewData(identifier);
      setBundle(data);
    } catch (e) {
      setError(e?.response?.data?.detail || e?.message || 'Failed to load overview');
      setBundle(null);
    } finally {
      setLoading(false);
    }
  }, [identifier]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { bundle, loading, error, refetch, identifier };
}
