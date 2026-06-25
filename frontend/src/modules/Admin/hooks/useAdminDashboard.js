import { useCallback, useEffect, useMemo, useState } from 'react';
import API from '../../../api/axiosConfig';
import { ArrowUpRight } from 'lucide-react';

export default function useAdminDashboard() {
  const [users, setUsers] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('pending');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const route = viewMode === 'verified' ? '/api/admin/verified-users' : '/api/admin/pending-users';
      const res = await API.get(route);
      setUsers(res.data || []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [viewMode]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const fetchDashboard = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await API.get('/api/admin/dashboard/summary', { params: { view: viewMode } });
      setDashboardData(res.data || null);
    } catch {
      setDashboardData(null);
    } finally {
      setStatsLoading(false);
    }
  }, [viewMode]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleAction = async (mobile, action) => {
    try {
      await API.post('/api/admin/verify-user', { mobile, action });
      setSelectedUser(null);
      fetchUsers();
      fetchDashboard();
    } catch {
      alert('Action failed!');
    }
  };

  const stats = useMemo(() => dashboardData?.stats || [], [dashboardData]);
  const recentActivities = useMemo(() => dashboardData?.recentActivities || [], [dashboardData]);
  const topCountries = useMemo(() => dashboardData?.topCountries || [], [dashboardData]);
  const transactionRows = useMemo(() => dashboardData?.transactionRows || [], [dashboardData]);
  const companyVerificationRequests = useMemo(
    () => dashboardData?.companyVerificationRequests || [],
    [dashboardData],
  );

  return {
    users,
    loading,
    selectedUser,
    setSelectedUser,
    viewMode,
    setViewMode,
    handleAction,
    refetchUsers: fetchUsers,
    stats,
    statsLoading,
    recentActivities,
    topCountries,
    transactionRows,
    companyVerificationRequests,
    trendIcon: ArrowUpRight,
  };
}
