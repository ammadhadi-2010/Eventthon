import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import PublicProjectPage from './pages/PublicProjectPage';
import PublicGigPage from './pages/PublicGigPage';
import PublicJobPage from './pages/PublicJobPage';

import PublicJobsBoardPage from './pages/PublicJobsBoardPage';
import PublicSquadPage from './pages/PublicSquadPage';

/** Authenticated showroom management & owner preview (same UI, manage mode). */
export default function ShowroomRoutes() {
  return (
    <Routes>
      <Route index element={<Navigate to="/projects/showrooms" replace />} />
      <Route path="projects/:projectId" element={<PublicProjectPage forceGuest={false} />} />
      <Route path="gigs/:gigId" element={<PublicGigPage forceGuest={false} />} />
      <Route path="jobs" element={<PublicJobsBoardPage forceGuest={false} />} />
      <Route path="jobs/:jobId" element={<PublicJobPage forceGuest={false} />} />
      <Route path="squads/:squadSlug" element={<PublicSquadPage />} />
      <Route path="*" element={<Navigate to="/projects/showrooms" replace />} />
    </Routes>
  );
}
