import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminShellLayout from './layout/AdminShellLayout';
import AdminPanel from './AdminPanel';
import UserManagementPage from './pages/UserManagement/UserManagementPage';
import UserDetailPage from './pages/UserDetail/UserDetailPage';
import SquadManagementPage from './pages/SquadManagement/SquadManagementPage';
import SquadDetails from './pages/SquadManagement/SquadDetails';
import GigManagementPage from './pages/GigManagement/GigManagementPage';
import GigDetails from './pages/GigManagement/GigDetails';
import ProjectManagementPage from './pages/ProjectManagement/ProjectManagementPage';
import JobManagementPage from './pages/JobManagement/JobManagementPage';
import JobSettingsPage from './pages/JobSettings/JobSettingsPage';
import OpportunitySettingsPage from './pages/JobSettings/OpportunitySettingsPage';
import AutomationPage from './pages/Automation/AutomationPage';
import CompanyManagementPage from './pages/CompanyManagement/CompanyManagementPage';
import CompanyAddHubPage from './pages/CompanyManagement/CompanyAddHubPage';
import CompanyVerificationPage from './pages/CompanyManagement/CompanyVerificationPage';
import CompanyDetailPage from './pages/CompanyDetail/CompanyDetailPage';
import VerificationRequestsPage from './pages/VerificationRequests/VerificationRequestsPage';
import VerificationRequestDetails from './pages/VerificationRequests/VerificationRequestDetails';
import RankManagement from './pages/RankManagement/RankManagement';
import RankDetails from './pages/RankManagement/RankDetails';
import GeneralSettings from './pages/SystemSettings/GeneralSettings';
import AdminChatPage from './pages/AdminChat/AdminChatPage';
import AdminNotificationsPage from './pages/AdminNotifications/AdminNotificationsPage';
import AdminBugReportsPage from './pages/BugReports/AdminBugReportsPage';
import AdminProfilePage from './pages/AdminProfile/AdminProfilePage';
import FooterContentManager from './pages/FooterResources/FooterContentManager';
import FoundersStoryContentPage from './pages/FoundersStory/FoundersStoryContentPage';
import AdminBlogManagementPage from './pages/BlogManagement/AdminBlogManagementPage';
import AdminCaseStudiesManagementPage from './pages/CaseStudiesManagement/AdminCaseStudiesManagementPage';
import AdminHelpCenterPage from './pages/HelpCenterManagement/AdminHelpCenterPage';
import AdminCommunityPage from './pages/CommunityManagement/AdminCommunityPage';
import AdminFooterBrandPage from './pages/FooterBrandManagement/AdminFooterBrandPage';
import SystemHealthPage from './pages/SystemHealth/SystemHealthPage';
import AdminTransactionsPage from './pages/Transactions/AdminTransactionsPage';
import AdminActivitiesPage from './pages/Activities/AdminActivitiesPage';
import CountriesAnalyticsPage from './pages/Analytics/CountriesAnalyticsPage';
import AdminPreviewViews from './preview/AdminPreviewViews';
import EmailOutreachPage from './pages/EmailOutreach/EmailOutreachPage';
import AdminWalletPage from './pages/WalletManagement/AdminWalletPage';
import AdminDonationManagementPage from './pages/DonationManagement/AdminDonationManagementPage';

const AdminRoutes = ({ userData }) => {
  const userRole = userData?.role || localStorage.getItem('userRole');
  const isAdmin = userRole === 'admin';

  if (!isAdmin) {
    console.warn('Unauthorized Access Attempt: Operative is not Admin.');
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="admin-layout bg-[#020617] min-h-screen">
      <Routes>
        <Route element={<AdminShellLayout />}>
          <Route index element={<AdminPanel />} />
          <Route path="dashboard" element={<AdminPanel />} />
          <Route path="system-health" element={<SystemHealthPage />} />
          <Route path="wallet" element={<AdminWalletPage />} />
          <Route path="transactions" element={<AdminTransactionsPage />} />
          <Route path="activities" element={<AdminActivitiesPage />} />
          <Route path="analytics/countries" element={<CountriesAnalyticsPage />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="users/detail" element={<UserDetailPage />} />
          <Route path="squads" element={<SquadManagementPage />} />
          <Route path="squads/:squadId" element={<SquadDetails />} />
          <Route path="gigs" element={<GigManagementPage />} />
          <Route path="gigs/:gigId" element={<GigDetails />} />
          <Route path="projects" element={<ProjectManagementPage />} />
          <Route path="jobs" element={<JobManagementPage />} />
          <Route path="jobs/settings" element={<JobSettingsPage />} />
          <Route path="jobs/opportunity-settings" element={<OpportunitySettingsPage />} />
          <Route path="automation" element={<AutomationPage />} />
          <Route path="email-outreach" element={<EmailOutreachPage />} />
          <Route path="companies" element={<CompanyManagementPage />} />
          <Route path="companies/add" element={<CompanyAddHubPage />} />
          <Route path="companies/verification" element={<CompanyVerificationPage />} />
          <Route path="companies/detail" element={<CompanyDetailPage />} />
          <Route path="chat" element={<AdminChatPage />} />
          <Route path="notifications" element={<AdminNotificationsPage />} />
          <Route path="bug-reports" element={<AdminBugReportsPage />} />
          <Route path="profile" element={<AdminProfilePage />} />
          <Route path="verification" element={<VerificationRequestsPage />} />
          <Route path="verification/:mobile" element={<VerificationRequestDetails />} />
          <Route path="ranks" element={<RankManagement />} />
          <Route path="ranks/:rankId" element={<RankDetails />} />
          <Route path="settings" element={<GeneralSettings />} />
          <Route path="footer-resources" element={<FooterContentManager />} />
          <Route path="blog" element={<AdminBlogManagementPage />} />
          <Route path="case-studies" element={<AdminCaseStudiesManagementPage />} />
          <Route path="help-center" element={<AdminHelpCenterPage />} />
          <Route path="community" element={<AdminCommunityPage />} />
          <Route path="footer-brand" element={<AdminFooterBrandPage />} />
          <Route path="donations" element={<AdminDonationManagementPage />} />
          <Route path="founders-story" element={<FoundersStoryContentPage />} />
          <Route path="preview/:section/*" element={<AdminPreviewViews userData={userData} />} />
          <Route path="preview" element={<Navigate to="/admin/preview/home" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/admin-control" replace />} />
      </Routes>
    </div>
  );
};

export default AdminRoutes;
