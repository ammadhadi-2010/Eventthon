import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AlertCenter from '../../../../modules/Dashboard/Alerts/AlertCenter';
import AlertDetailPage from '../../../../modules/Dashboard/Alerts/AlertDetailPage';
import CompanyNotificationsPageHead from '../components/CompanyNotificationsPageHead';
import '../styles/company-notifications-mobile.css';

export default function CompanyNotificationsPage() {
  return (
    <div className="cp-notifications-page">
      <CompanyNotificationsPageHead />
      <Routes>
        <Route index element={<AlertCenter employerMode />} />
        <Route path="alerts" element={<AlertCenter employerMode />} />
        <Route path="alerts/:alertId" element={<AlertDetailPage employerMode />} />
        <Route path="*" element={<Navigate to="/company/notifications" replace />} />
      </Routes>
    </div>
  );
}
