import { useCallback, useEffect, useRef, useState } from 'react';
import API from '../../../api/axiosConfig';
import { DEFAULT_OVERVIEW_TAB } from '../data/platformOverviewConfig';

export default function useOverviewTab(viewMode = 'pending') {
  const cacheRef = useRef({});
  const requestRef = useRef(0);
  const [activeTab, setActiveTab] = useState(DEFAULT_OVERVIEW_TAB);
  const [tab, setTab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cacheRef.current = {};
    setTab(null);
    setActiveTab(DEFAULT_OVERVIEW_TAB);
  }, [viewMode]);

  const loadTab = useCallback(async (tabId) => {
    const cached = cacheRef.current[tabId];
    if (cached) {
      setTab(cached);
      setLoading(false);
      setError('');
      return;
    }

    const requestId = requestRef.current + 1;
    requestRef.current = requestId;
    setLoading(true);
    setError('');

    try {
      const res = await API.get(`/api/admin/dashboard/overview/${tabId}`);
      if (requestRef.current !== requestId) return;
      const payload = res.data?.data || null;
      if (payload) cacheRef.current[tabId] = payload;
      setTab(payload);
    } catch (err) {
      if (requestRef.current !== requestId) return;
      setTab(null);
      setError(err?.response?.data?.detail || 'Failed to load overview');
    } finally {
      if (requestRef.current === requestId) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTab(activeTab);
  }, [activeTab, loadTab]);

  const onTabChange = useCallback((nextTab) => {
    setActiveTab(nextTab);
    const cached = cacheRef.current[nextTab];
    if (cached) {
      setTab(cached);
      setLoading(false);
      setError('');
      return;
    }
    setTab(null);
    setLoading(true);
  }, []);

  return { activeTab, onTabChange, tab, loading, error };
}
