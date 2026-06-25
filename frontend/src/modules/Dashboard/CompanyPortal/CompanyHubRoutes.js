import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import CompanyPortalLayout from './layout/CompanyPortalLayout';
import CompanyDashboard from './CompanyDashboard';
import CompanyComingSoon from './components/CompanyComingSoon';
import CompanyPortalPlaceholder from './pages/CompanyPortalPlaceholder';
import CompanySettingsPage from './pages/CompanySettingsPage';

const CompanyHubRoutes = () => (
  <Routes>
    <Route element={<CompanyPortalLayout />}>
      <Route index element={<CompanyDashboard />} />
      <Route path="jobs" element={<CompanyDashboard />} />
      <Route path="applications" element={<CompanyDashboard />} />
      <Route path="coming-soon/talent" element={<CompanyComingSoon title="Talent Search" />} />
      <Route path="coming-soon/messages" element={<CompanyComingSoon title="Messages" />} />
      <Route path="coming-soon/analytics" element={<CompanyComingSoon title="Analytics" />} />
      <Route path="profile" element={<CompanyPortalPlaceholder title="Public Profile" />} />
      <Route path="team" element={<CompanyPortalPlaceholder title="Team Members" />} />
      <Route path="settings" element={<CompanySettingsPage />} />
      <Route path="*" element={<Navigate to="/company/dashboard" replace />} />
    </Route>
  </Routes>
);

export default CompanyHubRoutes;
