import { useCallback, useEffect, useState } from 'react';
import {
  fetchCompanyMetrics,
  fetchCompanyVerificationRequests,
  patchAdminCompanyStatus,
} from '../../../../services/adminCompanyService';
import { buildCompanyStats } from './companyData';

function patchRows(list, id, patch) {
  return list.map((row) => (row.id === id ? { ...row, ...patch } : row));
}

function removeRow(list, id) {
  return list.filter((row) => row.id !== id);
}

export function useCompanyVerification() {
  const [metrics, setMetrics] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [m, pending] = await Promise.all([
        fetchCompanyMetrics(),
        fetchCompanyVerificationRequests(50),
      ]);
      setMetrics(m);
      setRows(pending);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to load verification requests.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const runCompanyAction = useCallback(
    async (row, action) => {
      const id = row?.id;
      if (!id) return null;
      if (action === 'view') return null;
      if (action === 'approve' || action === 'reject') {
        const updated = await patchAdminCompanyStatus(id, action);
        if (updated) {
          setRows((prev) => {
            if (action === 'approve' || action === 'reject') return removeRow(prev, id);
            return patchRows(prev, id, updated);
          });
          const m = await fetchCompanyMetrics();
          setMetrics(m);
        }
        return updated;
      }
      return null;
    },
    [],
  );

  return {
    stats: buildCompanyStats(metrics),
    rows,
    loading,
    error,
    runCompanyAction,
    reload: load,
  };
}
