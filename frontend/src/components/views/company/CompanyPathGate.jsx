import React from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import CompanyRoutes from '../../../modules/FooterPages/CompanyRoutes';
import CompanyWorkspaceRoutes from './CompanyWorkspaceRoutes';
import {
  isCompanyMarketingPath,
  isCompanyWorkspacePath,
} from '../../../modules/Dashboard/Navbar/companyWorkspacePaths';

export default function CompanyPathGate() {
  const { pathname } = useLocation();
  if (isCompanyMarketingPath(pathname)) {
    return <CompanyRoutes />;
  }
  if (isCompanyWorkspacePath(pathname)) {
    return <CompanyWorkspaceRoutes />;
  }
  return <Navigate to="/company/dashboard" replace />;
}
