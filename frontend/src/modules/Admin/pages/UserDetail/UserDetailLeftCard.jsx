import React from 'react';
import { Link } from 'react-router-dom';
import { FiCheck } from 'react-icons/fi';
import { Mail } from 'lucide-react';
import EventThonBadge from '../../../../components/EventThonBadge';
import { rankCodeToBadgeProps } from '../../../../components/badgeTierProps';
import { getRankMeta } from '../UserManagement/userManagementData';

import { getProfileAvatar } from '../UserManagement/userProfileReviewUtils';

export default function UserDetailLeftCard({ user, row }) {
  const rank = getRankMeta(row?.rank || 'recruit');
  const badgeProps = rankCodeToBadgeProps(rank.code, { label: rank.label });
  const displayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim() || row?.displayName || 'User';
  const handle = row?.handle || user?.user_id || '—';
  const city = user?.city || '—';
  const country = user?.country || '';
  const location = city !== '—' && country ? `${city}, ${country}` : city !== '—' ? city : country || '—';
  const st = row?.adminStatus;
  const active = st === 'approved' || user?.identity_status === 'Active';
  const suspended = st === 'suspended';

  return (
    <aside className="ud-card ud-left">
      <div className="ud-avatar-wrap">
        <img src={getProfileAvatar(user, row)} alt="" className="ud-avatar" />
        <span
          className={`ud-status-pill ${
            active ? 'ud-status-pill--ok' : suspended ? 'ud-status-pill--bad' : 'ud-status-pill--muted'
          }`}
        >
          {active ? 'Active' : suspended ? 'Suspended' : st === 'pending' ? 'Pending' : 'Inactive'}
        </span>
      </div>

      <div className="ud-name-block">
        <h2 className="ud-name">
          {displayName}
          {(row?.adminStatus === 'approved' || user?.verified) && (
            <span className="ud-verified" title="Verified">
              <FiCheck strokeWidth={3} />
            </span>
          )}
        </h2>
        <p className="ud-handle">@{handle}</p>
        <div className="ud-rank-badge-wrap">
          <EventThonBadge tier={badgeProps.tier} label={badgeProps.label} size="profile" />
        </div>
      </div>

      <dl className="ud-meta-list">
        <div className="ud-meta-row">
          <dt>User ID</dt>
          <dd>{row?.publicId || '—'}</dd>
        </div>
        <div className="ud-meta-row">
          <dt>Email</dt>
          <dd>{user?.email || '—'}</dd>
        </div>
        <div className="ud-meta-row">
          <dt>Phone</dt>
          <dd>{user?.mobile || '—'}</dd>
        </div>
        <div className="ud-meta-row">
          <dt>Location</dt>
          <dd>{location}</dd>
        </div>
        <div className="ud-meta-row">
          <dt>Joined</dt>
          <dd>{row?.joined || '—'}</dd>
        </div>
        <div className="ud-meta-row">
          <dt>Last active</dt>
          <dd>{row?.lastActive || '—'}</dd>
        </div>
      </dl>

      <div className="ud-left-actions">
        <Link to="/profile" className="ud-btn ud-btn--outline">
          View public profile
        </Link>
        <a href={user?.email ? `mailto:${user.email}` : '#'} className="ud-btn ud-btn--primary">
          <Mail size={16} aria-hidden />
          Message user
        </a>
      </div>
    </aside>
  );
}
