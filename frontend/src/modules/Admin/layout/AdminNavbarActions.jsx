import React from 'react';
import { FiBell, FiMessageSquare } from 'react-icons/fi';
import AdminProfileMenu from './AdminProfileMenu';
import { navStyles } from './adminNavbarShellStyle';

export default function AdminNavbarActions({
  menuRef,
  profileOpen,
  onToggleProfile,
  onCloseProfile,
  chatActive,
  notifActive,
  notifCount,
  onChat,
  onNotif,
  showUtilities,
  hubSwitch,
}) {
  return (
    <div className="agn-navbar__right" aria-label="Admin utilities" ref={menuRef}>
      {hubSwitch}
      {showUtilities ? (
        <>
          <button
            type="button"
            className={`agn-navbar__icon-btn${chatActive ? ' is-active' : ''}`}
            style={navStyles.rightSideIcon}
            onClick={onChat}
            aria-label="Admin chat"
          >
            <FiMessageSquare size={18} />
          </button>
          <button
            type="button"
            className={`agn-navbar__icon-btn${notifActive ? ' is-active' : ''}`}
            style={navStyles.rightSideIcon}
            onClick={onNotif}
            aria-label="Admin notifications"
          >
            <FiBell size={18} />
            {notifCount > 0 ? <span style={navStyles.neonBadge}>{notifCount}</span> : null}
          </button>
        </>
      ) : null}
      <button
        type="button"
        className="agn-navbar__profile"
        style={navStyles.profileBox}
        onClick={onToggleProfile}
        aria-expanded={profileOpen}
        aria-haspopup="menu"
      >
        <div style={navStyles.avatarWrapper}>
          <span className="agn-navbar__avatar-fallback" aria-hidden>
            SA
          </span>
          <span style={navStyles.onlineStatus} aria-hidden />
        </div>
        <span className="agn-navbar__profile-name">Super Admin ▾</span>
        {profileOpen ? <AdminProfileMenu onClose={onCloseProfile} /> : null}
      </button>
    </div>
  );
}
