import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AlertCenter from '../Alerts/AlertCenter';
import AlertDetailPage from '../Alerts/AlertDetailPage';

const NavbarRoutes = ({ userData }) => {
    return (
        <Routes>
            <Route path="notifications" element={<Navigate to="/notifications/alerts" replace />} />
            <Route path="alerts" element={<AlertCenter userData={userData} />} />
            <Route path="alerts/:alertId" element={<AlertDetailPage userData={userData} />} />
            {/* Mazeed settings ya notification related paths yahan aa sakty hain */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
};

export default NavbarRoutes;