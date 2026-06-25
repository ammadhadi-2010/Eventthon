import React from 'react';
import { resolveAdminProfileImageurl } from './adminProfileAvatar';

const COMMANDS = [
  { key: 'clear-cache', label: '⚙️ Clear Cache' },
  { key: 'main-lock', label: '🔒 Main Lock' },
  { key: 'database-sync', label: '🛡️ Database Sync' },
];

export default function AdminProfileCommandConsole({
  profile,
  onCommand,
  runningCommand,
  statusText,
}) {
  const fullName = profile?.full_name || 'Super Administrator';
  const avatarSrc = resolveAdminProfileImageurl(profile?.imageurl, fullName);

  return (
    <section className="ap-command-card">
      <div className="ap-command-head">
        <h3>System Node Operator Workspace</h3>
        <p>Execute protected infrastructure commands from the admin command console.</p>
      </div>

      <div className="ap-command-trigger">
        <img src={avatarSrc} alt="" className="ap-command-avatar" />
        <div className="ap-command-input">
          Issue a system command or review live infrastructure telemetry...
        </div>
      </div>

      <div className="ap-command-actions">
        {COMMANDS.map((command) => (
          <button
            key={command.key}
            type="button"
            className="ap-command-chip"
            onClick={() => onCommand(command.key)}
            disabled={Boolean(runningCommand)}
          >
            {runningCommand === command.key ? 'Running…' : command.label}
          </button>
        ))}
      </div>

      {statusText ? <p className="ap-command-status">{statusText}</p> : null}
    </section>
  );
}
