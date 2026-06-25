import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchAlertsBundle, markAlertRead, markAllAlertsRead } from '../services/alertsApi';
import { fetchEmployerAlertsBundle } from '../services/employerAlertsApi';
import { getAlertsIdentifier } from '../utils/alertsSession';
import { notifyAlertsRefresh } from '../utils/alertsNotify';
import { readStoredUserStub } from '../../../../utils/storedUser';

const EMPTY_STATS = { unread: 0, total: 0, today: 0, high_priority: 0 };

function resolveAlertsUser(userDataProp) {
  return userDataProp || readStoredUserStub();
}

export function useAlertCenterData({ userDataProp, employerMode = false }) {
  const userKey = useMemo(
    () => getAlertsIdentifier(resolveAlertsUser(userDataProp)),
    [userDataProp?.email, userDataProp?.mobile, userDataProp?.user_id],
  );

  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  const loadAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const user = resolveAlertsUser(userDataProp);
      const bundle = employerMode
        ? await fetchEmployerAlertsBundle(user)
        : await fetchAlertsBundle(user);
      setStats(bundle?.stats ?? EMPTY_STATS);
      setAlerts(Array.isArray(bundle?.feed) ? bundle.feed : []);
      setCategories(Array.isArray(bundle?.categories) ? bundle.categories : []);
    } catch (error) {
      console.error('Alerts operational breakdown:', error);
      setStats(EMPTY_STATS);
      setAlerts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [employerMode, userKey]);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const handleMarkAllRead = useCallback(async () => {
    try {
      setMarking(true);
      await markAllAlertsRead(resolveAlertsUser(userDataProp));
      notifyAlertsRefresh();
      await loadAlerts();
    } catch (error) {
      console.error('Mark-all-read failed:', error);
    } finally {
      setMarking(false);
    }
  }, [loadAlerts, userKey]);

  const handleOpenAlert = useCallback(async (item) => {
    try {
      if (!item?._id || item.is_read) return;
      await markAlertRead(item._id);
      setAlerts((prev) => prev.map((a) => (a._id === item._id ? { ...a, is_read: true } : a)));
      setStats((prev) =>
        prev ? { ...prev, unread: Math.max((prev.unread || 1) - 1, 0) } : prev,
      );
      notifyAlertsRefresh();
    } catch (error) {
      console.error('Open alert failed:', error);
    }
  }, []);

  return {
    stats,
    alerts,
    categories,
    loading,
    marking,
    loadAlerts,
    handleMarkAllRead,
    handleOpenAlert,
  };
}
