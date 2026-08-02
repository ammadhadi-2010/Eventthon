import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import CompanyPortalLayout from './layout/CompanyPortalLayout';
import CompanyDashboard from './CompanyDashboard';
import CompanyComingSoon from './components/CompanyComingSoon';
import CompanyPortalPlaceholder from './pages/CompanyPortalPlaceholder';
import CompanySettingsPage from './pages/CompanySettingsPage';
import CompanyMessagesPage from './pages/CompanyMessagesPage';
import CompanyNotificationsPage from './pages/CompanyNotificationsPage';
import CompanyAllJobsPage from './pages/CompanyAllJobsPage';
import CompanyDraftJobsPage from './pages/CompanyDraftJobsPage';
import CompanyApplicationsPage from './pages/CompanyApplicationsPage';
import CompanySavedCandidatesPage from './pages/CompanySavedCandidatesPage';
import CompanyFollowersPage from './pages/CompanyFollowersPage';
import CompanyTeamMembersPage from './pages/CompanyTeamMembersPage';
import { JobsHubProvider } from '../../../modules/Dashboard/Jobs/context/JobsHubContext';
import CreateJobAlertPage from '../../../modules/Dashboard/Jobs/createJobAlert/CreateJobAlertPage';

function CompanyDashboardRoutes() {
  return (
    <Routes>
      <Route index element={<CompanyDashboard />} />
      <Route path="jobs" element={<CompanyAllJobsPage />} />
      <Route
        path="jobs/new"
        element={(
          <JobsHubProvider>
            <CreateJobAlertPage mode="company" />
          </JobsHubProvider>
        )}
      />
      <Route path="draft-jobs" element={<CompanyDraftJobsPage />} />
      <Route path="applications" element={<CompanyApplicationsPage />} />
      <Route path="saved-candidates" element={<CompanySavedCandidatesPage />} />
      <Route path="followers" element={<CompanyFollowersPage />} />
      <Route path="coming-soon/talent" element={<CompanyComingSoon title="Talent Search" />} />
      <Route path="coming-soon/analytics" element={<CompanyComingSoon title="Analytics" />} />
      <Route path="coming-soon/draft-jobs" element={<Navigate to="/company/dashboard/draft-jobs" replace />} />
      <Route path="coming-soon/saved-candidates" element={<Navigate to="/company/dashboard/saved-candidates" replace />} />
      <Route path="coming-soon/followers" element={<Navigate to="/company/dashboard/followers" replace />} />
      <Route path="coming-soon/wallet" element={<CompanyComingSoon title="Company Wallet" />} />
      <Route path="coming-soon/billing" element={<CompanyComingSoon title="Billing & Subscription" />} />
      <Route path="coming-soon/privacy" element={<CompanyComingSoon title="Privacy" />} />
      <Route path="profile" element={<CompanyPortalPlaceholder title="Public Profile" />} />
      <Route path="team" element={<CompanyTeamMembersPage />} />
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
