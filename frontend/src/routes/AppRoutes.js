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

function RequireAuth({ children }) {
  return hasStoredSession() ? children : <Navigate to="/auth/login" replace />;
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
        window.dispatchEvent(new CustomEvent('et:profile-updated', { detail: profile }));
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
    const onFocus = () => fetchGlobalProfile();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [fetchGlobalProfile, userIdentifier]);

  return (
    <Routes>
      <Route path="/public/*" element={<PublicRoutes />} />
      <Route path="/auth/*" element={<AuthRoutes />} />
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
              <Route path="showrooms/*" element={<ShowroomRoutes />} />
              <Route
                path="profile/*"
                element={<ProfileRoutes userData={userData} refreshData={refreshProfile} />}
              />
              <Route path="squads/*" element={<SquadRoutes userData={userData} />} />
              <Route path="networks" element={<Navigate to="/profile/connections/connections" replace />} />
              <Route path="events" element={<Navigate to="/notifications" replace />} />
              <Route path="projects/*" element={<ProjectsRoutes userData={userData} />} />
              <Route path="gigs/*" element={<GigsRoutes />} />
              <Route path="jobs/*" element={<JobsRoutes />} />
              <Route path="company/*" element={<CompanyPathGate />} />
              <Route
                path="company-hub/*"
                element={<RequireAuth><CompanyHubRoutes /></RequireAuth>}
              />
              <Route path="company-panel/*" element={<Navigate to="/company/dashboard" replace />} />
              <Route
                path="messages/*"
                element={<RequireAuth><MessagesRoutes /></RequireAuth>}
              />
              <Route
                path="wallet/*"
                element={<RequireAuth><WalletRoutes userData={userData} /></RequireAuth>}
              />
              <Route
                path="notifications/*"
                element={<RequireAuth><NavbarRoutes userData={userData} /></RequireAuth>}
              />
              <Route path="admin/dashboard" element={<Navigate to="/admin-control" replace />} />
              <Route path="admin/profile" element={<Navigate to="/admin-control/profile" replace />} />
              <Route path="admin/system-health" element={<Navigate to="/admin-control/system-health" replace />} />
              <Route path="admin/wallet" element={<Navigate to="/admin-control/wallet" replace />} />
              <Route path="admin/transactions" element={<Navigate to="/admin-control/transactions" replace />} />
              <Route path="admin/activities" element={<Navigate to="/admin-control/activities" replace />} />
              <Route path="admin/analytics/countries" element={<Navigate to="/admin-control/analytics/countries" replace />} />
              <Route path="admin/email-outreach" element={<Navigate to="/admin-control/email-outreach" replace />} />
              <Route
                path="admin-control/*"
                element={<RequireAuth><AdminRoutes userData={userData} /></RequireAuth>}
              />
              <Route
                path="admin/preview/*"
                element={<RequireAuth><AdminPreviewRoutes userData={userData} /></RequireAuth>}
              />
              <Route path="article/*" element={<ArticleRoutes userData={userData} />} />
              <Route path="updates/*" element={<UpdatesRoutes userData={userData} />} />
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
