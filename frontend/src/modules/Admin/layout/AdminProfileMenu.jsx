import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLogOut, FiSettings } from 'react-icons/fi';
import { ADMIN_DASHBOARD_PATH, ADMIN_PROFILE_PATH } from './adminWorkspacePaths';

export default function AdminProfileMenu({ onClose }) {
  const navigate = useNavigate();

  const go = (path) => {
    onClose();
    navigate(path);
  };

  const signOut = () => {
    onClose();
    localStorage.clear();
    window.location.href = '/auth/login';
  };

  return (
    <div className="agn-menu" role="menu" onClick={(e) => e.stopPropagation()}>
      <div className="agn-menu__header">
        <div className="agn-menu__avatar" aria-hidden>
          SA
        </div>
        <div>
          <p className="agn-menu__name">Super Administrator</p>
          <p className="agn-menu__role">EventThon Admin Control</p>
        </div>
      </div>
      <button type="button" className="agn-menu__item" onClick={() => go(ADMIN_DASHBOARD_PATH)}>
        Admin Dashboard
      </button>
      <button
        type="button"
        className="agn-menu__item agn-menu__item--profile"
        onClick={() => go(ADMIN_PROFILE_PATH)}
      >
        👤 View Profile
      </button>
      <button type="button" className="agn-menu__item" onClick={() => go('/admin-control/settings')}>
        <FiSettings size={14} />
        System Settings
      </button>
      <hr className="agn-menu__divider" />
      <button type="button" className="agn-menu__item agn-menu__item--danger" onClick={signOut}>
        <FiLogOut size={14} />
        Sign out
      </button>
    </div>
  );
}
