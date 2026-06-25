import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import CompanyPortalLayout from './layout/CompanyPortalLayout';
import CompanyHubCreatePage from './pages/CompanyHubCreatePage';

const CompanyHubRoutes = () => (
  <Routes>
    <Route element={<CompanyPortalLayout />}>
      <Route path="create" element={<CompanyHubCreatePage />} />
      <Route path="*" element={<Navigate to="/company-hub/create" replace />} />
    </Route>
  </Routes>
);

export default CompanyHubRoutes;
