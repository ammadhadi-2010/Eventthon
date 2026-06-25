import React from 'react';
import { Hexagon } from 'lucide-react';
import { getRankMeta, getStatusMeta, presenceDotClass } from './userManagementData';
import { resolveUserAvatar } from './userManagementAvatar';
import UserManagementRowMenu from './UserManagementRowMenu';

function formatJoined(iso) {
  if (!iso) return '—';
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function UserManagementTable({ rows, onUserAction, onOpenUser, loading }) {
  return (
    <div className={`um-table-wrap${loading ? ' um-table-wrap--loading' : ''}`}>
      <div className="um-table-scroll w-full overflow-x-auto scrollbar-thin">
        <table className="um-table min-w-[1000px] w-full">
          <thead>
            <tr>
              <th>User</th>
              <th className="um-th-id">ID</th>
              <th className="um-th-email">Email</th>
              <th>Role</th>
              <th>Rank</th>
              <th>Status</th>
              <th className="um-th-joined">Joined On</th>
              <th className="um-th-active">Last Active</th>
              <th className="um-th-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9} className="um-table-empty">
                  No users match this filter.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const rank = getRankMeta(row.rank);
                const status = getStatusMeta(row.adminStatus);
                const dot = presenceDotClass(row.presence);
                const avatarSrc = resolveUserAvatar(row);
                return (
                  <tr key={row.id}>
                    <td>
                      <button
                        type="button"
                        className="um-user-cell um-user-cell--link min-h-[44px] touch-manipulation"
                        onClick={() => onOpenUser?.(row)}
                        title="Open full user profile"
                      >
                        <img src={avatarSrc} alt="" className="um-avatar" />
                        <div className="um-user-text">
                          <span className="um-name">{row.displayName}</span>
                          <span className="um-handle">@{row.handle}</span>
                        </div>
                      </button>
                    </td>
                    <td className="um-td-mono um-th-id">{row.publicId}</td>
                    <td className="um-td-email um-th-email">{row.email}</td>
                    <td>
                      <span className="um-role-pill">{row.role}</span>
                    </td>
                    <td>
                      <span className={`um-rank-badge ${rank.shieldClass}`}>
                        <Hexagon size={13} className="um-rank-hex" strokeWidth={2} aria-hidden />
                        <span>{rank.label}</span>
                      </span>
                    </td>
                    <td>
                      <span className={`um-status-chip ${status.chipClass}`}>{status.label}</span>
                    </td>
                    <td className="um-td-muted um-th-joined">{formatJoined(row.joined)}</td>
                    <td className="um-th-active">
                      <span className="um-last-active">
                        <span className={`um-dot ${dot}`} />
                        {row.lastActive}
                      </span>
                    </td>
                    <td className="um-th-actions">
                      <UserManagementRowMenu
                        row={row}
                        onAction={onUserAction}
                        onOpenUser={onOpenUser}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
