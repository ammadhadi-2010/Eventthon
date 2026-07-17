import { useCallback, useEffect, useState } from 'react';
import { fetchOutreachReplies, syncOutreachReplies } from '../../services/emailOutreachApi';

const POLL_MS = 60000;

export default function useOutreachReplies({ leadId = '', limit = 50, refreshKey = 0 } = {}) {
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchOutreachReplies({
        lead_id: leadId || undefined,
        limit,
      });
      setReplies(Array.isArray(data?.replies) ? data.replies : []);
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to load replies');
      setReplies([]);
    } finally {
      setLoading(false);
    }
  }, [leadId, limit]);

  const syncNow = useCallback(async () => {
    setSyncing(true);
    try {
      await syncOutreachReplies();
      await load();
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to sync inbox');
    } finally {
      setSyncing(false);
    }
  }, [load]);

  useEffect(() => {
    load();
    const timer = window.setInterval(load, POLL_MS);
    return () => window.clearInterval(timer);
  }, [load, refreshKey]);

  return { replies, loading, syncing, error, refresh: load, syncNow };
}
