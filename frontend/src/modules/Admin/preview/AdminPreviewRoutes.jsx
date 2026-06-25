import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AdminShellLayout from '../layout/AdminShellLayout';
import AdminPreviewViews from './AdminPreviewViews';

export default function AdminPreviewRoutes({ userData }) {
  const userRole = userData?.role || localStorage.getItem('userRole');
  if (userRole !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="admin-layout bg-[#020617] min-h-screen">
      <Routes>
        <Route element={<AdminShellLayout />}>
          <Route path=":section/*" element={<AdminPreviewViews userData={userData} />} />
          <Route index element={<Navigate to="/admin/preview/home" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/admin/preview/home" replace />} />
      </Routes>
    </div>
  );
}
