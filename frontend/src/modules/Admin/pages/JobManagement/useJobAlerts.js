import { useCallback, useEffect, useState } from 'react';
import { fetchAdminJobAlerts } from '../../../../services/adminJobService';

export function useJobAlerts(active) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!active) return;
    setLoading(true);
    setError('');
    try {
      const list = await fetchAdminJobAlerts();
      setRows(list.rows);
    } catch (err) {
      setRows([]);
      setError(err?.response?.data?.detail || 'Failed to load job alerts.');
    } finally {
      setLoading(false);
    }
  }, [active]);

  useEffect(() => {
    load();
  }, [load]);

  return { rows, loading, error, reload: load };
}
