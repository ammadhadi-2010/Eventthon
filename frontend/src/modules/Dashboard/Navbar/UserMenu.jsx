import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiActivity, FiBriefcase, FiGlobe, FiHeart, FiHelpCircle, FiLogOut, FiSettings, FiUser, FiCreditCard,
} from 'react-icons/fi';
import { getAvatarUrl, getDisplayBio, getDisplayName } from './userMenuUtils';
import { resolveCompanyHubAccess } from './useCompanyHubAccess';
import { readStoredUserStub } from '../../../utils/storedUser';
import './user-menu.css';

const UserMenu = ({ user, onClose, mobileSheet = false }) => {
  const navigate = useNavigate();
  const [avatarSrc, setAvatarSrc] = useState(() => getAvatarUrl(user));
  const [sessionUser, setSessionUser] = useState(() => user || readStoredUserStub());

  useEffect(() => {
    setSessionUser(user || readStoredUserStub());
  }, [user]);

  useEffect(() => {
    const syncSession = (event) => {
      if (event?.detail && typeof event.detail === 'object') {
        setSessionUser((prev) => ({ ...(prev || {}), ...event.detail }));
        return;
      }
      setSessionUser(readStoredUserStub());
    };
    window.addEventListener('et:profile-updated', syncSession);
    return () => window.removeEventListener('et:profile-updated', syncSession);
  }, []);

  const canAccessCompany = resolveCompanyHubAccess(sessionUser);

  const go = (path) => {
    onClose?.();
    // Defer navigation so the mobile portal can unmount cleanly after the click
    window.setTimeout(() => navigate(path), 0);
  };

  const signOut = () => {
    onClose?.();
    localStorage.clear();
    window.setTimeout(() => {
      window.location.href = '/auth/login';
    }, 0);
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
        <h5 className="et-user-menu__section-title">Quick</h5>
        <button type="button" className="et-user-menu__item" onClick={() => go('/profile')}>
          <FiUser size={16} aria-hidden /> Profile
        </button>
        <button type="button" className="et-user-menu__item" onClick={() => go('/wallet')}>
          <FiCreditCard size={16} aria-hidden /> Wallet
        </button>
        <button type="button" className="et-user-menu__item" onClick={() => go('/dashboard/settings')}>
          <FiSettings size={16} aria-hidden /> Settings
        </button>
        <button type="button" className="et-user-menu__item" onClick={() => go('/resources/help')}>
          <FiHelpCircle size={16} aria-hidden /> Help
        </button>
        <button type="button" className="et-user-menu__item et-user-menu__item--donate" onClick={() => go('/donate')}>
          <FiHeart size={16} aria-hidden /> ❤️ Donate
        </button>
      </div>

      <hr className="et-user-menu__divider" />

      <div className="et-user-menu__section">
        <h5 className="et-user-menu__section-title">Account</h5>
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
