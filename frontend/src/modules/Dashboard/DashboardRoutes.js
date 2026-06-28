import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import MainDashboard from './MainDashboard';
import AccountSettings from './accountHub/AccountSettings';
import ManageActivity from './accountHub/ManageActivity';
import { hasStoredSession } from '../../utils/storedUser';

const DashboardRoutes = ({ userData, refreshData }) => {
  return (
    <div style={{ fontFamily: 'Sans-Serif', width: '100%', color: '#ffffff' }}>
      <Routes>
        <Route index element={<MainDashboard userData={userData} />} />
        <Route path="profile" element={<Navigate to="/profile" replace />} />
        <Route
          path="settings"
          element={
            hasStoredSession() ? (
              <AccountSettings
                userData={userData}
                onSave={async (result) => {
                  if (result?.email) localStorage.setItem('userEmail', result.email);
                  if (result?.fullName) localStorage.setItem('userName', result.fullName);
                  if (refreshData) await refreshData();
                }}
              />
            ) : (
              <Navigate to="/auth/login" replace />
            )
          }
        />
        <Route
          path="activity"
          element={hasStoredSession() ? <ManageActivity /> : <Navigate to="/auth/login" replace />}
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
};

export default DashboardRoutes;
