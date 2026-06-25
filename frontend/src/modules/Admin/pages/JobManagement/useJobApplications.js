import { useCallback, useEffect, useState } from 'react';
import {
  fetchAdminJobApplications,
  patchAdminJobApplication,
} from '../../../../services/adminJobService';

export function useJobApplications(active) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    if (!active) return;
    setLoading(true);
    setError('');
    try {
      const list = await fetchAdminJobApplications();
      setRows(list.rows);
    } catch (err) {
      setRows([]);
      setError(err?.response?.data?.detail || 'Failed to load applications.');
    } finally {
      setLoading(false);
    }
  }, [active]);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = useCallback(async (applicationId, status) => {
    if (!['shortlisted', 'rejected'].includes(status)) return false;
    setBusyId(applicationId);
    const prev = rows;
    setRows((list) =>
      list.map((row) => (row.id === applicationId ? { ...row, status } : row)),
    );
    try {
      const updated = await patchAdminJobApplication(applicationId, status);
      if (updated) {
        setRows((list) => list.map((row) => (row.id === applicationId ? updated : row)));
      }
      return true;
    } catch (err) {
      setRows(prev);
      console.warn('Application status update failed:', err?.response?.data?.detail || err?.message);
      return false;
    } finally {
      setBusyId(null);
    }
  }, [rows]);

  return { rows, loading, error, busyId, setStatus, reload: load };
}
