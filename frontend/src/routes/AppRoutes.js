import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { fetchProfileMe } from '../modules/Dashboard/Profile/services/profileService';
import { hasStoredSession, persistUserSession, readStoredUserStub, clearStaleSession } from '../utils/storedUser';

import AuthRoutes from '../modules/Auth/AuthRoutes';
import AdminRoutes from '../modules/Admin/AdminRoutes';
import AdminPreviewRoutes from '../modules/Admin/preview/AdminPreviewRoutes';
import DashboardRoutes from '../modules/Dashboard/DashboardRoutes';
import MainDashboard from '../modules/Dashboard/MainDashboard';
import ProfileRoutes from '../modules/Dashboard/Profile/ProfileRoutes';
import SquadRoutes from '../modules/Dashboard/SquadNetwork/SquadRoutes';
import WalletRoutes from '../modules/Dashboard/Wallet/WalletRoutes';
import NavbarRoutes from '../modules/Dashboard/Navbar/NavbarRoutes';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import ResourcesRoutes from '../modules/FooterPages/ResourcesRoutes';
import FoundersStoryPage from '../modules/FoundersStory/FoundersStoryPage';
import ArticleRoutes from '../modules/Dashboard/ArticleEditor/ArticleRoutes';
import GigsRoutes from '../modules/Dashboard/Gigs/GigsRoutes';
import ProjectsRoutes from '../modules/Dashboard/Projects/ProjectsRoutes';
import JobsRoutes from '../modules/Dashboard/Jobs/JobsRoutes';
import CompanyPathGate from '../components/views/company/CompanyPathGate';
import CompanyHubRoutes from '../components/views/company/CompanyHubRoutes';
import MessagesRoutes from '../modules/Dashboard/Messages/MessagesRoutes';
import PublicRoutes from '../modules/Public/PublicRoutes';
import ShowroomRoutes from '../modules/Public/ShowroomRoutes';
import UpdatesRoutes from '../modules/Dashboard/Updates/UpdatesRoutes';

function resolveHomePath(userData) {
  if (!hasStoredSession()) return '/';
  if (userData?.role === 'admin' || localStorage.getItem('userRole') === 'admin') {
    return '/admin-control';
  }
  if (userData?.role === 'employer' || localStorage.getItem('userRole') === 'employer') {
    return '/company/dashboard';
  }
  return '/dashboard';
}

const AppRoutes = () => {
  const [userData, setUserData] = useState(() => readStoredUserStub());

  const userEmail = localStorage.getItem('userEmail');
  const userMobile = localStorage.getItem('userMobile');
  const userIdentifier = userEmail || userMobile;

  const fetchGlobalProfile = useCallback(async () => {
    if (!userIdentifier) {
      setUserData(null);
      return;
    }

    const stub = readStoredUserStub();
    if (stub) setUserData((prev) => (prev?._fromStorage || !prev ? stub : prev));

    try {
      const profile = await fetchProfileMe(userIdentifier);
      if (profile) {
        persistUserSession(profile);
        setUserData(profile);
      }
    } catch (err) {
      const timedOut = err?.code === 'ECONNABORTED' || String(err?.message || '').includes('timeout');
      if (!timedOut) console.warn('Profile sync failed:', err?.message || err);
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        clearStaleSession();
        setUserData(null);
        return;
      }
      if (stub) setUserData((prev) => ({ ...stub, ...prev, _fromStorage: true }));
    }
  }, [userEmail, userMobile, userIdentifier]);

  const refreshProfile = useCallback(() => fetchGlobalProfile(), [fetchGlobalProfile]);

  useEffect(() => {
    if (!userIdentifier) {
      setUserData(null);
      return undefined;
    }
    fetchGlobalProfile();
  }, [fetchGlobalProfile, userIdentifier]);

  return (
    <Routes>
      <Route path="/public/*" element={<PublicRoutes />} />
      <Route path="/auth/*" element={<AuthRoutes />} />
      {/* Public home: guests see MainDashboard + 40s login prompt — no redirect chain */}
      <Route
        path="/"
        element={
          <DashboardLayout userData={userData} refreshData={refreshProfile}>
            <MainDashboard userData={userData} />
          </DashboardLayout>
        }
      />

      <Route
        path="/*"
        element={
          <DashboardLayout userData={userData} refreshData={refreshProfile}>
            <Routes>
              <Route
                path="dashboard/*"
                element={<DashboardRoutes userData={userData} refreshData={refreshProfile} />}
              />
              <Route
                path="showrooms/*"
                element={hasStoredSession() ? <ShowroomRoutes /> : <Navigate to="/auth/login" replace />}
              />
              <Route
                path="profile/*"
                element={
                  hasStoredSession() ? (
                    <ProfileRoutes userData={userData} refreshData={refreshProfile} />
                  ) : (
                    <Navigate to="/auth/login" replace />
                  )
                }
              />
              <Route
                path="squads/*"
                element={hasStoredSession() ? <SquadRoutes userData={userData} /> : <Navigate to="/auth/login" replace />}
              />
              <Route path="networks" element={<Navigate to="/profile/connections/connections" replace />} />
              <Route path="events" element={<Navigate to="/notifications" replace />} />
              <Route
                path="projects/*"
                element={hasStoredSession() ? <ProjectsRoutes userData={userData} /> : <Navigate to="/auth/login" replace />}
              />
              <Route path="gigs/*" element={hasStoredSession() ? <GigsRoutes /> : <Navigate to="/auth/login" replace />} />
              <Route path="jobs/*" element={hasStoredSession() ? <JobsRoutes /> : <Navigate to="/auth/login" replace />} />
              <Route
                path="company/*"
                element={hasStoredSession() ? <CompanyPathGate /> : <Navigate to="/auth/login" replace />}
              />
              <Route
                path="company-hub/*"
                element={hasStoredSession() ? <CompanyHubRoutes /> : <Navigate to="/auth/login" replace />}
              />
              <Route path="company-panel/*" element={<Navigate to="/company/dashboard" replace />} />
              <Route
                path="messages/*"
                element={hasStoredSession() ? <MessagesRoutes /> : <Navigate to="/auth/login" replace />}
              />
              <Route
                path="wallet/*"
                element={hasStoredSession() ? <WalletRoutes userData={userData} /> : <Navigate to="/auth/login" replace />}
              />
              <Route
                path="notifications/*"
                element={hasStoredSession() ? <NavbarRoutes userData={userData} /> : <Navigate to="/auth/login" replace />}
              />
              <Route path="admin/dashboard" element={<Navigate to="/admin-control" replace />} />
              <Route path="admin/profile" element={<Navigate to="/admin-control/profile" replace />} />
              <Route path="admin/system-health" element={<Navigate to="/admin-control/system-health" replace />} />
              <Route path="admin/transactions" element={<Navigate to="/admin-control/transactions" replace />} />
              <Route path="admin/activities" element={<Navigate to="/admin-control/activities" replace />} />
              <Route path="admin/analytics/countries" element={<Navigate to="/admin-control/analytics/countries" replace />} />
              <Route
                path="admin-control/*"
                element={hasStoredSession() ? <AdminRoutes userData={userData} /> : <Navigate to="/auth/login" replace />}
              />
              <Route
                path="admin/preview/*"
                element={
                  hasStoredSession() ? (
                    <AdminPreviewRoutes userData={userData} />
                  ) : (
                    <Navigate to="/auth/login" replace />
                  )
                }
              />
              <Route
                path="article/*"
                element={hasStoredSession() ? <ArticleRoutes userData={userData} /> : <Navigate to="/auth/login" replace />}
              />
              <Route
                path="updates/*"
                element={hasStoredSession() ? <UpdatesRoutes userData={userData} /> : <Navigate to="/auth/login" replace />}
              />
              <Route path="resources/*" element={<ResourcesRoutes />} />
              <Route path="founders-story" element={<FoundersStoryPage userData={userData} />} />
              <Route
                path="*"
                element={<Navigate to={resolveHomePath(userData)} replace />}
              />
            </Routes>
          </DashboardLayout>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
