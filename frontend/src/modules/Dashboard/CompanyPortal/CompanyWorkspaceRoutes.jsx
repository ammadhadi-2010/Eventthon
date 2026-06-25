import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import CompanyPortalLayout from './layout/CompanyPortalLayout';
import CompanyDashboard from './CompanyDashboard';
import CompanyComingSoon from './components/CompanyComingSoon';
import CompanyPortalPlaceholder from './pages/CompanyPortalPlaceholder';
import CompanySettingsPage from './pages/CompanySettingsPage';
import CompanyMessagesPage from './pages/CompanyMessagesPage';
import CompanyNotificationsPage from './pages/CompanyNotificationsPage';

function CompanyDashboardRoutes() {
  return (
    <Routes>
      <Route index element={<CompanyDashboard />} />
      <Route path="jobs" element={<CompanyDashboard />} />
      <Route path="applications" element={<CompanyDashboard />} />
      <Route path="coming-soon/talent" element={<CompanyComingSoon title="Talent Search" />} />
      <Route path="coming-soon/analytics" element={<CompanyComingSoon title="Analytics" />} />
      <Route path="profile" element={<CompanyPortalPlaceholder title="Public Profile" />} />
      <Route path="team" element={<CompanyPortalPlaceholder title="Team Members" />} />
      <Route path="settings" element={<CompanySettingsPage />} />
      <Route path="*" element={<Navigate to="/company/dashboard" replace />} />
    </Routes>
  );
}

export default function CompanyWorkspaceRoutes() {
  return (
    <Routes>
      <Route element={<CompanyPortalLayout />}>
        <Route path="dashboard/*" element={<CompanyDashboardRoutes />} />
        <Route path="messages/*" element={<CompanyMessagesPage />} />
        <Route path="notifications/*" element={<CompanyNotificationsPage />} />
        <Route index element={<Navigate to="/company/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/company/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
