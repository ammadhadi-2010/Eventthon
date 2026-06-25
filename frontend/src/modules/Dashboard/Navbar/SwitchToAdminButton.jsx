import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShield } from 'react-icons/fi';
import { ADMIN_DASHBOARD_PATH } from '../../Admin/layout/adminWorkspacePaths';
import './hub-switch.css';

export default function SwitchToAdminButton({ className = '', to = ADMIN_DASHBOARD_PATH }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      className={`et-hub-switch et-hub-switch--admin${className ? ` ${className}` : ''}`}
      onClick={() => navigate(to)}
      title="Return to admin control panel"
    >
      <FiShield size={14} aria-hidden />
      <span>Switch to Admin</span>
    </button>
  );
}
