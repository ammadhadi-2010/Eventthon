import React from 'react';
import { FiMail, FiClock } from 'react-icons/fi';

function formatWhen(raw) {
  if (!raw) return '';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return String(raw).slice(0, 16);
  return d.toLocaleString();
}

export default function TeamPendingRow({ invite, canRevoke, onRevoke }) {
  return (
    <li className="cp-apps-list__row cp-apps-list__row--aurora cp-team-row">
      <div className="cp-team-pending__avatar" aria-hidden>
        <FiMail size={18} />
      </div>
      <div className="cp-apps-list__main">
        <strong>{invite.email}</strong>
        <span>{invite.roleLabel || invite.role}</span>
        <em>Invited by {invite.invitedBy || 'Owner'} · Expires {formatWhen(invite.expiresAt)}</em>
      </div>
      <div className="cp-team-row__side">
        <span className="cp-team-row__status is-invited">Pending</span>
        {invite.userExists ? <em className="cp-apps-list__time">Existing user</em> : (
          <em className="cp-apps-list__time"><FiClock size={11} /> Needs signup</em>
        )}
        {canRevoke ? (
          <div className="cp-team-row__actions">
            <button type="button" className="is-danger" onClick={() => onRevoke?.(invite)}>
              Revoke
            </button>
          </div>
        ) : null}
      </div>
    </li>
  );
}
