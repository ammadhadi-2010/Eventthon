import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiActivity, FiBriefcase, FiGlobe, FiHelpCircle, FiLogOut, FiSettings } from 'react-icons/fi';
import { getAvatarUrl, getDisplayBio, getDisplayName } from './userMenuUtils';
import './user-menu.css';

const UserMenu = ({ user, onClose, mobileSheet = false }) => {
  const navigate = useNavigate();
  const [avatarSrc, setAvatarSrc] = useState(() => getAvatarUrl(user));
  const canAccessCompany =
    localStorage.getItem('userRole') === 'employer' && Boolean(localStorage.getItem('companyId'));

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
    <div
      className={`et-user-menu${mobileSheet ? ' et-user-menu--mobile-sheet' : ''}`}
      role="menu"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="et-user-menu__header">
        <div className="et-user-menu__identity">
          <img
            src={avatarSrc}
            alt=""
            className="et-user-menu__avatar"
            onError={() => setAvatarSrc(getAvatarUrl(null))}
          />
          <div className="et-user-menu__text">
            <h4 className="et-user-menu__name">{getDisplayName(user)}</h4>
            <p className="et-user-menu__bio">{getDisplayBio(user)}</p>
          </div>
        </div>
        <button type="button" className="et-user-menu__btn et-user-menu__btn--outline" onClick={() => go('/profile')}>
          View Profile
        </button>
        <button type="button" className="et-user-menu__btn et-user-menu__btn--primary" onClick={() => go('/profile/verify')}>
          Verify now
        </button>
      </div>

      <hr className="et-user-menu__divider" />

      <div className="et-user-menu__section">
        <h5 className="et-user-menu__section-title">Account</h5>
        <button type="button" className="et-user-menu__item" onClick={() => go('/dashboard/settings')}>
          <FiSettings size={16} aria-hidden /> Settings &amp; Privacy
        </button>
        <button type="button" className="et-user-menu__item" onClick={() => go('/help')}>
          <FiHelpCircle size={16} aria-hidden /> Help
        </button>
        <button type="button" className="et-user-menu__item" onClick={() => go('/language')}>
          <FiGlobe size={16} aria-hidden /> Language
        </button>
      </div>

      <hr className="et-user-menu__divider" />

      <div className="et-user-menu__section">
        <h5 className="et-user-menu__section-title">Manage</h5>
        <button type="button" className="et-user-menu__item" onClick={() => go('/dashboard/activity')}>
          <FiActivity size={16} aria-hidden /> Posts &amp; Activity
        </button>
        <button type="button" className="et-user-menu__item" onClick={() => go('/gigs')}>
          <FiBriefcase size={16} aria-hidden /> Job Posting Account
        </button>
        {canAccessCompany ? (
          <button type="button" className="et-user-menu__item" onClick={() => go('/company/dashboard')}>
            <FiBriefcase size={16} aria-hidden /> Switch to Company
          </button>
        ) : null}
      </div>

      <hr className="et-user-menu__divider" />

      <button type="button" className="et-user-menu__item et-user-menu__item--danger" onClick={signOut}>
        <FiLogOut size={16} aria-hidden /> Sign out
      </button>
    </div>
  );
};

export default UserMenu;
