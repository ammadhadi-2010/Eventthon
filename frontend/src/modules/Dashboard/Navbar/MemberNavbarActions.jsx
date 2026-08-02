import React from 'react';
import { FiMessageSquare } from 'react-icons/fi';
import { navStyles } from './NavStyles';
import UserMenu from './UserMenu.jsx';
import HubUserAdminSwitch from './HubUserAdminSwitch';
import { getAvatarUrl } from './userMenuUtils';

export default function MemberNavbarActions({
  menuRef,
  user,
  profileOpen,
  onToggleProfile,
  onCloseProfile,
  onChat,
  mobileInline = false,
}) {
  return (
    <div
      className={`member-navbar__right${mobileInline ? ' member-navbar__right--mobile-inline flex items-center gap-2 flex-nowrap shrink-0' : ''}`}
      aria-label="Member hub utilities"
      ref={menuRef}
    >
      <HubUserAdminSwitch className="member-navbar__hub-switch" />
      <button
        type="button"
        className="member-navbar__icon-btn"
        style={navStyles.rightSideIcon}
        onClick={onChat}
        aria-label="Open messages"
      >
        <FiMessageSquare size={18} />
      </button>
      <button
        type="button"
        className="member-navbar__profile"
        style={navStyles.profileBox}
        onClick={onToggleProfile}
        aria-expanded={profileOpen}
        aria-haspopup="menu"
      >
        <div style={navStyles.avatarWrapper}>
          <img
            src={getAvatarUrl(user)}
            alt=""
            style={navStyles.avatarImg}
            onError={(e) => {
              e.currentTarget.src = getAvatarUrl(null);
            }}
          />
          <span style={navStyles.onlineStatus} aria-hidden />
        </div>
        {!mobileInline && profileOpen ? <UserMenu user={user} onClose={onCloseProfile} /> : null}
      </button>
    </div>
  );
}
