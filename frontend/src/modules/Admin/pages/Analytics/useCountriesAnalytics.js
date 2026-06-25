import { useCallback, useEffect, useState } from 'react';
import API from '../../../../api/axiosConfig';

export default function useCountriesAnalytics() {
  const [rows, setRows] = useState([]);
  const [networkTotal, setNetworkTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/admin/analytics/countries');
      setRows(res.data?.rows || []);
      setNetworkTotal(res.data?.networkTotal || 0);
      setError('');
    } catch (err) {
      setRows([]);
      setError(err?.response?.data?.detail || 'Failed to load country analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { rows, networkTotal, loading, error, reload: load };
}
