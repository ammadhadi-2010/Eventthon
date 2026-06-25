import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { JobsHubProvider } from './context/JobsHubContext';
import JobsPage from './JobsPage';
import CreateJobAlertPage from './createJobAlert/CreateJobAlertPage';
import JobsShowroomPanelsLayoutPage from '../../Public/pages/JobsShowroomPanelsLayoutPage';

const MENU_SECTIONS = [
  'applications',
  'saved',
  'alerts',
  'recommended',
  'assessment',
  'interview',
  'companies',
  'salary',
  'settings',
];

const JobsRoutes = () => (
  <JobsHubProvider>
    <Routes>
      <Route index element={<JobsPage defaultSection="browse" />} />
      <Route path="showrooms" element={<JobsShowroomPanelsLayoutPage />} />
      <Route path="alerts/new" element={<CreateJobAlertPage />} />
      {MENU_SECTIONS.map((section) => (
        <Route key={section} path={section} element={<JobsPage defaultSection={section} />} />
      ))}
      <Route path="*" element={<Navigate to="/jobs" replace />} />
    </Routes>
  </JobsHubProvider>
);

export default JobsRoutes;
