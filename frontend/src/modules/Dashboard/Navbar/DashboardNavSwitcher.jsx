import React from 'react';
import { useLocation } from 'react-router-dom';
import AdminNavbar from '../../Admin/layout/AdminNavbar';
import { isAdminControlPath } from '../../Admin/layout/adminWorkspacePaths';
import Navbar from './Navbar';
import CompanyNavbar from './CompanyNavbar';
import { isCompanyWorkspacePath } from './companyWorkspacePaths';

export default function DashboardNavSwitcher({ user, notifCount }) {
  const { pathname } = useLocation();
  if (isAdminControlPath(pathname)) {
    return <AdminNavbar />;
  }
  if (isCompanyWorkspacePath(pathname)) {
    return <CompanyNavbar user={user} notifCount={notifCount} />;
  }
  return <Navbar user={user} notifCount={notifCount} />;
}
