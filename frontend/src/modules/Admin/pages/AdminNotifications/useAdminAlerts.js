import { useCallback, useEffect, useState } from 'react';
import {
  fetchAdminAlertsBundle,
  markAdminAlertRead,
  markAllAdminAlertsRead,
} from '../../services/adminAlertsApi';
import { mergeAdminCategories } from './adminAlertCategories';

export default function useAdminAlerts() {
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedPriorities, setSelectedPriorities] = useState([]);
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [statusText, setStatusText] = useState('');

  const loadAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const bundle = await fetchAdminAlertsBundle();
      setStats(bundle.stats);
      setAlerts(bundle.feed);
      setCategories(mergeAdminCategories(bundle.categories));
    } catch (error) {
      console.error('Admin alerts load failed:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAlerts();
    const onChange = () => loadAlerts();
    window.addEventListener('et:admin-alerts-changed', onChange);
    return () => window.removeEventListener('et:admin-alerts-changed', onChange);
  }, [loadAlerts]);

  const handleMarkAllRead = async () => {
    try {
      setMarking(true);
      await markAllAdminAlertsRead();
      await loadAlerts();
    } catch (error) {
      console.error('Admin mark-all-read failed:', error);
    } finally {
      setMarking(false);
    }
  };

  const handleOpenAlert = async (item) => {
    try {
      if (item?._id && !item.is_read) {
        await markAdminAlertRead(item._id);
        setAlerts((prev) => prev.map((a) => (a._id === item._id ? { ...a, is_read: true } : a)));
        setStats((prev) =>
          prev ? { ...prev, unread: Math.max((prev.unread || 1) - 1, 0) } : prev,
        );
      }
    } catch (error) {
      console.error('Admin open alert failed:', error);
    }
  };

  const normalizedAlerts = alerts.map((item) => ({
    ...item,
    uiType:
      item.category === 'verification'
        ? 'User Verifications'
        : item.category === 'company_signup'
          ? 'Company Signups'
          : item.category === 'flagged'
            ? 'Flagged Content'
            : item.category === 'system'
              ? 'System Alerts'
              : item.category === 'support'
                ? 'Support Logs'
                : item.category === 'bug_report'
                  ? 'User Bug Reports'
                  : 'All Types',
    uiPriority:
      item.priority === 'high'
        ? 'High'
        : item.priority === 'medium'
          ? 'Medium'
          : item.priority === 'low'
            ? 'Low'
            : 'All Priorities',
  }));

  const filteredAlerts = normalizedAlerts.filter((item) => {
    if (activeCategory !== 'all' && item.category !== activeCategory) return false;
    if (onlyUnread && item.is_read) return false;
    if (selectedTypes.length && !selectedTypes.includes(item.uiType)) return false;
    if (selectedPriorities.length && !selectedPriorities.includes(item.uiPriority)) return false;
    return true;
  });

  const enhancedCategories = categories.map((c) => ({
    ...c,
    active: c.key === activeCategory,
  }));

  const toggleListSelection = (current, value) => {
    if (value === 'All Types' || value === 'All Priorities') return [];
    return current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
  };

  return {
    stats,
    filteredAlerts,
    enhancedCategories,
    activeCategory,
    setActiveCategory,
    selectedTypes,
    setSelectedTypes,
    selectedPriorities,
    setSelectedPriorities,
    onlyUnread,
    setOnlyUnread,
    statusText,
    setStatusText,
    loading,
    marking,
    handleMarkAllRead,
    handleOpenAlert,
    toggleListSelection,
  };
}
