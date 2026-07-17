import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiShield, FiUser } from 'react-icons/fi';

function isAdminSession() {
  return localStorage.getItem('userRole') === 'admin';
}

function isAdminAreaPath(pathname = '') {
  const path = String(pathname || '');
  return path.startsWith('/admin') || path.startsWith('/admin-control');
}

export default function HubUserAdminSwitch({ className = '' }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (!isAdminSession()) return null;

  const onAdminArea = isAdminAreaPath(pathname);
  const label = onAdminArea ? 'Switch to User' : 'Switch to Admin';
  const target = onAdminArea ? '/dashboard' : '/admin/dashboard';

  return (
    <button
      type="button"
      className={`agn-hub-switch agn-hub-switch--prominent${className ? ` ${className}` : ''}`}
      onClick={() => navigate(target)}
      title={label}
      aria-label={label}
    >
      {onAdminArea ? <FiUser size={13} aria-hidden /> : <FiShield size={13} aria-hidden />}
      <span className="agn-hub-switch__label">{label}</span>
    </button>
  );
}
