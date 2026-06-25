import { useCallback, useEffect, useState } from 'react';
import { fetchSystemHealth, SYSTEM_HEALTH_POLL_MS } from '../../../services/systemHealthService';

export default function useSystemHealth() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      const data = await fetchSystemHealth();
      setHealth(data);
      setError('');
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Health check failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, SYSTEM_HEALTH_POLL_MS);
    return () => window.clearInterval(timer);
  }, [refresh]);

  return { health, loading, error, refresh };
}
