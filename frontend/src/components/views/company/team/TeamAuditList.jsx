import React from 'react';

const LABELS = {
  invite_sent: 'Invite sent',
  invite_accepted: 'Invite accepted',
  invite_declined: 'Invite declined',
  invite_revoked: 'Invite revoked',
  role_changed: 'Role changed',
  member_suspended: 'Member suspended',
  member_reactivated: 'Member reactivated',
  member_removed: 'Member removed',
  ownership_transferred: 'Ownership transferred',
};

function formatWhen(raw) {
  if (!raw) return '';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return String(raw).slice(0, 19);
  return d.toLocaleString();
}

export default function TeamAuditList({ logs = [] }) {
  if (!logs.length) {
    return <p className="cp-empty">No activity logged yet.</p>;
  }
  return (
    <ul className="cp-team-audit">
      {logs.map((row) => (
        <li key={row.id}>
          <strong>{LABELS[row.action] || row.action}</strong>
          <span>
            {row.actorEmail || 'system'}
            {row.targetEmail ? ` → ${row.targetEmail}` : ''}
            {row.meta?.role ? ` (${row.meta.role})` : ''}
          </span>
          <em>{formatWhen(row.createdAt)}</em>
        </li>
      ))}
    </ul>
  );
}
