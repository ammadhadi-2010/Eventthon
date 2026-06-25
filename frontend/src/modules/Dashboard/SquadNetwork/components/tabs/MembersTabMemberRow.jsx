import React from 'react';
import { FiMail, FiMoreVertical } from 'react-icons/fi';
import { getAvatarUrl } from '../../../Navbar/userMenuUtils';
import { squadMemberAvatarSrc } from '../../utils/squadMemberAvatar';
import {
  formatJoinDate,
  getPageLabel,
  getStatus,
  memberCredential,
  optionalPill,
  rolePill,
} from './membersTabHelpers';

const statusClass = (key) => `sq-members-status sq-members-status--${key}`;

export default function MembersTabMemberRow({
  member,
  index,
  safeId,
  activeMenuId,
  onToggleMenu,
  onMessage,
  onRoleChange,
  onRemove,
}) {
  const status = getStatus(member, index);
  const pageLabel = getPageLabel(member, index);
  const joined = formatJoinDate(member, index);
  const role = member.role || 'Member';
  const menuOpen = activeMenuId === safeId;

  const menu = menuOpen ? (
    <div className="sq-members-action-menu" role="menu">
      <button type="button" className="sq-members-action-menu-item" role="menuitem" onClick={() => onRoleChange(member, 'Admin')}>
        Make Admin
      </button>
      <button type="button" className="sq-members-action-menu-item" role="menuitem" onClick={() => onRoleChange(member, 'Moderator')}>
        Make Moderator
      </button>
      <button type="button" className="sq-members-action-menu-item" role="menuitem" onClick={() => onRoleChange(member, 'Member')}>
        Set as Member
      </button>
      <button type="button" className="sq-members-action-menu-item sq-members-action-menu-item--danger" role="menuitem" onClick={() => onRemove(member)}>
        Remove Member
      </button>
    </div>
  ) : null;

  const avatar = (
    <img
      className="sq-members-avatar"
      src={squadMemberAvatarSrc(member)}
      alt={member.name || 'Member'}
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = getAvatarUrl(null);
      }}
    />
  );

  const menuBtn = (
    <div className="sq-members-menu-wrap">
      <button
        type="button"
        className="sq-members-menu-btn"
        aria-expanded={menuOpen}
        aria-label={`Actions for ${member.name || 'member'}`}
        onClick={() => onToggleMenu(safeId)}
      >
        <FiMoreVertical size={16} />
      </button>
      {menu}
    </div>
  );

  return (
    <article className="sq-members-table-row sq-members-grid-card">
      <div className="sq-members-mobile-card">
        <div className="sq-members-card-top">
          <div className="sq-members-card-profile">
            {avatar}
            <div className="sq-members-identity">
              <h3 className="sq-members-member-name">{member.name || 'Member'}</h3>
              <p className="sq-members-member-email">{memberCredential(member)}</p>
            </div>
          </div>
          {menuBtn}
        </div>

        <dl className="sq-members-card-details">
          <div className="sq-members-metric">
            <dt className="sq-members-metric-label">Page</dt>
            <dd><span className="sq-members-pill" style={optionalPill(member, index)}>{pageLabel}</span></dd>
          </div>
          <div className="sq-members-metric">
            <dt className="sq-members-metric-label">Role</dt>
            <dd><span className="sq-members-pill" style={rolePill(role)}>{role}</span></dd>
          </div>
          <div className="sq-members-metric">
            <dt className="sq-members-metric-label">Status</dt>
            <dd>
              <span className={statusClass(status.key)}>
                <span className="sq-members-status-dot" aria-hidden />
                {status.label}
              </span>
            </dd>
          </div>
          <div className="sq-members-metric">
            <dt className="sq-members-metric-label">Joined</dt>
            <dd className="sq-members-joined-value">{joined}</dd>
          </div>
        </dl>

        <button type="button" className="sq-members-mobile-mail" onClick={() => onMessage(member)}>
          <FiMail size={14} /> Message
        </button>
      </div>

      <div className="sq-members-desktop-row">
        <div className="sq-members-row-member sq-members-card-body">
          {avatar}
          <div className="sq-members-identity">
            <strong className="sq-members-member-name">{member.name || 'Member'}</strong>
            <span className="sq-members-role-pill--inline sq-members-pill" style={rolePill(role)}>{role}</span>
          </div>
        </div>
        <span className="sq-members-cell-optional sq-members-pill" style={optionalPill(member, index)}>{pageLabel}</span>
        <span className="sq-members-cell-role sq-members-pill" style={rolePill(role)}>{role}</span>
        <span className={`sq-members-cell-status ${statusClass(status.key)}`}>
          <span className="sq-members-status-dot" aria-hidden />
          {status.label}
        </span>
        <span className="sq-members-cell-joined sq-members-joined">{joined}</span>
        <div className="sq-members-actions sq-members-row-actions">
          <button type="button" className="sq-members-mail-btn sq-members-icon-btn" onClick={() => onMessage(member)}>
            <FiMail size={14} />
          </button>
          {menuBtn}
        </div>
      </div>
    </article>
  );
}
