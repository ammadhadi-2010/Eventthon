import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AlertCenter from '../Alerts/AlertCenter';

/** Legacy /notifications path — full alert center (replaces mock list). */
const NotificationsPage = ({ userData }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (window.location.pathname === '/notifications' && !window.location.pathname.includes('/alerts')) {
      navigate('/notifications/alerts', { replace: true });
    }
  }, [navigate]);

  return <AlertCenter userData={userData} />;
};

export default NotificationsPage;
