import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import PublicUserPage from './pages/PublicUserPage';
import PublicSquadPage from './pages/PublicSquadPage';
import PublicGigPage from './pages/PublicGigPage';
import PublicProjectPage from './pages/PublicProjectPage';
import PublicJobPage from './pages/PublicJobPage';
import PublicJobsBoardPage from './pages/PublicJobsBoardPage';
import PublicSquadsDirectoryPage from './pages/PublicSquadsDirectoryPage';

export default function PublicRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="users/:username" element={<PublicUserPage />} />
        <Route path="squads" element={<PublicSquadsDirectoryPage />} />
        <Route path="squads/:squadSlug" element={<PublicSquadPage />} />
        <Route path="gigs/:gigId" element={<PublicGigPage />} />
        <Route path="projects/:projectId" element={<PublicProjectPage />} />
        <Route path="jobs" element={<PublicJobsBoardPage />} />
        <Route path="jobs/:jobId" element={<PublicJobPage />} />
        <Route path="*" element={<Navigate to="/public/squads" replace />} />
      </Route>
    </Routes>
  );
}
