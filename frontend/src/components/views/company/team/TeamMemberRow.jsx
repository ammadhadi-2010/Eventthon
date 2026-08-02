import React from 'react';
import { FiMail, FiShield } from 'react-icons/fi';
import { resolvePortalImageurl } from '../utils/portalImage';

const TONES = ['mint', 'aurora', 'cobalt', 'solar', 'plasma', 'coral'];

function formatWhen(raw) {
  if (!raw) return '';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return String(raw).slice(0, 10);
  return d.toLocaleDateString();
}

export default function TeamMemberRow({
  member,
  index = 0,
  roles = [],
  permissions = [],
  meId = '',
  onRoleChange,
  onSuspend,
  onUnsuspend,
  onRemove,
  onTransfer,
}) {
  const tone = TONES[index % TONES.length];
  const canManageRoles = permissions.includes('manage_roles');
  const canSuspend = permissions.includes('suspend_members');
  const canRemove = permissions.includes('remove_members');
  const canTransfer = permissions.includes('transfer_ownership');
  const isOwner = member.role === 'owner';
  const isMe = member.id === meId;
  const suspended = member.status === 'suspended';
  const invitableRoles = roles.filter((r) => r.invitable);

  return (
    <li className={`cp-apps-list__row cp-apps-list__row--${tone} cp-team-row`}>
      <img
        className="cp-apps-list__avatar"
        src={resolvePortalImageurl(member.imageurl, member.name || member.email)}
        alt=""
      />
      <div className="cp-apps-list__main">
        <strong>{member.name || member.email}</strong>
        <em><FiMail size={11} aria-hidden /> {member.email}</em>
      </div>
      <div className="cp-team-row__side">
        {canManageRoles && !isOwner ? (
          <select
            className="cp-team-row__role-select"
            value={member.role}
            onChange={(e) => onRoleChange?.(member, e.target.value)}
            aria-label={`Role for ${member.name || member.email}`}
          >
            {invitableRoles.map((r) => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
          </select>
        ) : (
          <span className="cp-team-row__role">
            <FiShield size={12} aria-hidden />
            {member.roleLabel || member.role}
          </span>
        )}
        <em className="cp-apps-list__time">
          {suspended ? 'Suspended' : `Joined ${formatWhen(member.joinedAt)}`}
        </em>
        <span className={`cp-team-row__status${suspended ? ' is-suspended' : ''}`}>
          {member.status}
        </span>
        <div className="cp-team-row__actions">
          {!isOwner && canSuspend && !suspended ? (
            <button type="button" onClick={() => onSuspend?.(member)}>Suspend</button>
          ) : null}
          {!isOwner && canSuspend && suspended ? (
            <button type="button" onClick={() => onUnsuspend?.(member)}>Unsuspend</button>
          ) : null}
          {!isOwner && canRemove ? (
            <button type="button" className="is-danger" onClick={() => onRemove?.(member)}>Remove</button>
          ) : null}
          {!isOwner && !isMe && canTransfer && !suspended ? (
            <button type="button" onClick={() => onTransfer?.(member)}>Make owner</button>
          ) : null}
        </div>
      </div>
    </li>
  );
}
