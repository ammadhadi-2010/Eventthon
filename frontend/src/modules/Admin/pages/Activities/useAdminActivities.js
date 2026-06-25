import { useCallback, useEffect, useState } from 'react';
import API from '../../../../api/axiosConfig';

export default function useAdminActivities() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/admin/activities', { params: { limit: 200 } });
      setRows(res.data?.rows || []);
      setError('');
    } catch (err) {
      setRows([]);
      setError(err?.response?.data?.detail || 'Failed to load activities');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { rows, loading, error, reload: load };
}
