import { useCallback, useEffect, useMemo, useState } from 'react';
import API from '../../../../api/axiosConfig';
import { getGigsActorId, getGigsSessionHeaders } from '../utils/gigsSession';

const legacyRead = () => {
  try {
    const raw = localStorage.getItem('savedGigIds');
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const legacyWrite = (rows) => {
  localStorage.setItem('savedGigIds', JSON.stringify(rows));
};

const getUserId = () => getGigsActorId();

const useSavedGigs = () => {
  const [savedRows, setSavedRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const userId = useMemo(() => (typeof window === 'undefined' ? '' : getUserId()), []);

  const loadSaved = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await API.get('/api/gigs/actions/saved', {
        headers: getGigsSessionHeaders(),
        params: { seller_user_id: userId },
      });
      setSavedRows(Array.isArray(res?.data?.saved) ? res.data.saved : []);
    } catch {
      setSavedRows([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadSaved();
  }, [loadSaved]);

  const toggleSaved = async (payload) => {
    if (!userId || !payload?.gig_ref_id) return;
    const existing = savedRows.find((row) => row.gig_ref_id === payload.gig_ref_id);
    if (existing?._id) {
      if (!String(existing._id).startsWith('legacy-')) {
        await API.delete(`/api/gigs/actions/saved/${existing._id}`, {
          headers: getGigsSessionHeaders(),
          params: { seller_user_id: userId },
        });
      }
      setSavedRows((prev) => prev.filter((row) => row._id !== existing._id));
      const nextLegacy = legacyRead().filter((id) => `recent-${id}` !== payload.gig_ref_id);
      legacyWrite(nextLegacy);
      return;
    }
    const res = await API.post('/api/gigs/actions/saved', {
      seller_user_id: userId,
      ...payload,
    }, { headers: getGigsSessionHeaders() });
    const saved = res?.data?.saved;
    if (saved?._id) {
      setSavedRows((prev) => [saved, ...prev.filter((row) => row._id !== saved._id)]);
    }
    const raw = String(payload.gig_ref_id || '');
    const match = raw.match(/^recent-(\d+)$/);
    if (match) {
      const idNum = Number(match[1]);
      const nextLegacy = Array.from(new Set([...legacyRead(), idNum]));
      legacyWrite(nextLegacy);
    }
  };

  const removeSaved = async (savedId) => {
    if (!userId || !savedId) return;
    if (!String(savedId).startsWith('legacy-')) {
      await API.delete(`/api/gigs/actions/saved/${savedId}`, {
        headers: getGigsSessionHeaders(),
        params: { seller_user_id: userId },
      });
    }
    setSavedRows((prev) => prev.filter((row) => row._id !== savedId));
    if (String(savedId).startsWith('legacy-')) {
      const rawId = String(savedId).replace('legacy-', '');
      const nextLegacy = legacyRead().filter((id) => String(id) !== rawId);
      legacyWrite(nextLegacy);
    }
  };

  const clearSaved = async () => {
    if (!userId) return;
    await API.delete('/api/gigs/actions/saved', {
      headers: getGigsSessionHeaders(),
      params: { seller_user_id: userId },
    });
    setSavedRows([]);
    legacyWrite([]);
  };

  return {
    userId,
    loading,
    savedRows,
    savedGigIdsLegacy: legacyRead(),
    loadSaved,
    toggleSaved,
    removeSaved,
    clearSaved,
  };
};

export default useSavedGigs;
