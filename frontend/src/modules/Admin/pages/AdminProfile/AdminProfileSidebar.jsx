import React, { useEffect, useState } from 'react';
import { FiCheckCircle, FiClipboard, FiShield } from 'react-icons/fi';
import { resolveAdminProfileImageurl } from './adminProfileAvatar';

export default function AdminProfileSidebar({ profile }) {
  const [avatarBroken, setAvatarBroken] = useState(false);
  const fullName = profile?.full_name || 'Super Administrator';
  const avatarSrc = resolveAdminProfileImageurl(profile?.imageurl, fullName);
  const metrics = profile?.metrics || {};
  const network = profile?.network || {};

  useEffect(() => setAvatarBroken(false), [avatarSrc]);

  return (
    <aside className="ap-sidebar">
      <section className="ap-card ap-profile-card">
        <div className="ap-avatar-wrap">
          <div className="ap-avatar-ring">
            {!avatarBroken ? (
              <img
                src={avatarSrc}
                alt={fullName}
                className="ap-avatar-img"
                onError={() => setAvatarBroken(true)}
              />
            ) : (
              <span className="ap-avatar-fallback">{fullName.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <span className="ap-level-badge">99</span>
        </div>

        <h3 className="ap-username">{fullName}</h3>
        <p className="ap-role">{profile?.headline || 'EventThon Infrastructure Command'}</p>

        <div className="ap-rank-pill">{profile?.role_badge || '★ Super Administrator'}</div>

        <div className="ap-xp-track">
          <div className="ap-xp-fill" style={{ width: '96%' }} />
        </div>

        <div className="ap-metric-row">
          <div>
            <span className="ap-metric-label">Access Level</span>
            <strong>{metrics.access_level ?? 99}</strong>
          </div>
          <div>
            <span className="ap-metric-label">Command Power</span>
            <strong>{Number(metrics.command_power ?? 9999).toLocaleString()}</strong>
          </div>
          <div>
            <span className="ap-metric-label">Node Rank</span>
            <strong>{metrics.node_rank || '#1 Root'}</strong>
          </div>
        </div>

        <div className="ap-network-row">
          <span>
            <FiShield /> {network.audits ?? 58} Audits
          </span>
          <span>
            <FiClipboard /> {network.verifications ?? 12} Verifications
          </span>
          <span>
            <FiCheckCircle /> {network.resolved ?? 24} Resolved
          </span>
        </div>
      </section>

      <section className="ap-card ap-status-card">
        <h4 className="ap-section-title">Tech Admin Status</h4>
        <p className="ap-status-line">Infrastructure perimeter: Secure</p>
        <p className="ap-status-line">Command channel: Active</p>
        <p className="ap-status-line">Audit stream: Live</p>
      </section>
    </aside>
  );
}
