import React from 'react';
import UserProfileReviewModal from './pages/UserManagement/UserProfileReviewModal';
import { commandCenterCards } from './data/adminConfig';
import useAdminDashboard from './hooks/useAdminDashboard';
import useSystemHealth from './hooks/useSystemHealth';
import AdminHeader from './sections/AdminHeader';
import StatsGrid from './sections/StatsGrid';
import TopCountriesStrip from './sections/TopCountriesStrip';
import PlatformOverview from './sections/platformOverview/PlatformOverview';
import ReviewQueue from './sections/ReviewQueue';
import RecentActivitiesCard from './sections/RecentActivitiesCard';
import CommandCenterCard from './sections/CommandCenterCard';
import CompanyVerificationRequestsCard from './sections/CompanyVerificationRequestsCard';
import './styles/AdminShell.css';
import './styles/AdminCards.css';
import './styles/admin-skeleton.css';
import './pages/SystemHealth/systemHealth.css';

const AdminPanel = () => {
  const {
    users,
    loading,
    selectedUser,
    setSelectedUser,
    viewMode,
    setViewMode,
    refetchUsers,
    stats,
    statsLoading,
    recentActivities,
    topCountries,
    transactionRows,
    companyVerificationRequests,
    trendIcon,
  } = useAdminDashboard();
  const { health, loading: healthLoading } = useSystemHealth();

  return (
    <>
      <AdminHeader
        viewMode={viewMode}
        setViewMode={setViewMode}
        health={health}
        healthLoading={healthLoading}
      />
      <StatsGrid stats={stats} TrendIcon={trendIcon} loading={statsLoading} />
      {!statsLoading ? <TopCountriesStrip items={topCountries} /> : null}

      <div style={{ marginTop: '20px' }}>
        <PlatformOverview viewMode={viewMode} />
      </div>

      <div className="admin-grid-2" style={{ marginTop: '20px' }}>
        <div className="admin-stack">
          <ReviewQueue
            users={users}
            viewMode={viewMode}
            loading={loading}
            onSelectUser={setSelectedUser}
            rows={transactionRows}
          />
        </div>

        <div className="admin-stack">
          <RecentActivitiesCard items={recentActivities} />
          <CompanyVerificationRequestsCard items={companyVerificationRequests} />
          <CommandCenterCard cards={commandCenterCards} />
        </div>
      </div>

      <UserProfileReviewModal
        reviewTarget={
          selectedUser?.mobile
            ? {
                mobile: selectedUser.mobile,
                seedUser: selectedUser,
                row: {
                  mobile: selectedUser.mobile,
                  email: selectedUser.email,
                  displayName: `${selectedUser.first_name || ''} ${selectedUser.last_name || ''}`.trim(),
                  handle: selectedUser.user_id || selectedUser.email?.split('@')[0],
                  adminStatus: 'pending',
                },
              }
            : null
        }
        onClose={() => setSelectedUser(null)}
        onComplete={() => {
          setSelectedUser(null);
          refetchUsers();
        }}
      />
    </>
  );
};

export default AdminPanel;
