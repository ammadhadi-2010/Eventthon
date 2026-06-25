import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import MainDashboard from './MainDashboard';
import AccountSettings from './accountHub/AccountSettings';
import ManageActivity from './accountHub/ManageActivity';

const DashboardRoutes = ({ userData, refreshData }) => {
    // Check if user is authenticated via mobile number
    // DashboardRoutes.js (Purani Line 11):
const storedMobile = localStorage.getItem('userMobile');
const storedEmail = localStorage.getItem('userEmail'); // Ye line add karein

// Check if authenticated via either mobile OR email
if (!storedMobile && !storedEmail) {
    return <Navigate to="/auth/login" replace />;
}

    return (
        <div style={{ fontFamily: 'Sans-Serif', width: '100%', color: '#ffffff' }}>
            <Routes>
                <Route index element={<MainDashboard userData={userData} />} />
                <Route path="profile" element={<Navigate to="/profile" replace />} />
                <Route
                  path="settings"
                  element={
                    <AccountSettings
                      userData={userData}
                      onSave={async (result) => {
                        if (result?.email) localStorage.setItem('userEmail', result.email);
                        if (result?.fullName) localStorage.setItem('userName', result.fullName);
                        if (refreshData) await refreshData();
                      }}
                    />
                  }
                />
                <Route path="activity" element={<ManageActivity />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </div>
    );
};

export default DashboardRoutes;