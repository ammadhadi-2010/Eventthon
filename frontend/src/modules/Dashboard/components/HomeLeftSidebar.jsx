import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiBookmark, FiCheck, FiCheckCircle, FiChevronRight, FiClipboard, FiUsers, FiUser,
} from 'react-icons/fi';
import EventThonBadge from '../../../components/EventThonBadge';
import { rankCodeToBadgeProps } from '../../../components/badgeTierProps';
import { getRankMeta } from '../../Admin/pages/UserManagement/userManagementData';
import { getUserDisplayName, pickImageurl, resolveDashboardMediaUrl } from '../utils/dashboardMedia';
import './home-left-sidebar.css';
const STREAK_DAYS = [
  { label: 'M', done: true },
  { label: 'T', done: true },
  { label: 'W', done: true },
  { label: 'T', done: false },
  { label: 'F', done: true },
  { label: 'S', done: false },
  { label: 'S', done: false },
];

const QUICK_LINKS = [
  { label: 'My Profile', to: '/profile', Icon: FiUser },
  { label: 'Saved Items', to: '/jobs/saved', Icon: FiBookmark },
  { label: 'Browse Squads', to: '/squads', Icon: FiUsers },
  { label: 'My Applications', to: '/jobs/applications', Icon: FiClipboard },
];

function WalletSparkline() {
  return (
    <svg className="hls-wallet-graph" viewBox="0 0 240 48" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="hlsGraphStroke" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <polyline
        points="0,36 28,30 56,34 84,22 112,26 140,14 168,18 196,10 240,16"
        fill="none"
        stroke="url(#hlsGraphStroke)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

const DRAWER_QUICK_LINKS = QUICK_LINKS.filter((link) =>
  ['My Profile', 'Saved Items', 'Browse Squads'].includes(link.label),
);

export default function HomeLeftSidebar({ userData, drawerMode = false }) {
  const [avatarBroken, setAvatarBroken] = useState(false);
  const displayName = getUserDisplayName(userData) || 'Anonymous User';
  const avatarSrc = resolveDashboardMediaUrl(pickImageurl(userData));
  const showAvatar = Boolean(avatarSrc) && !avatarBroken;
  const level = Number(userData?.level || userData?.xp_level || 78);
  const etPower = Number(userData?.et_power || 8560);
  const rankNo = Number(userData?.rank_number || 248);
  const balance = Number(userData?.wallet_balance || 12560);
  const usdValue = (balance / 100).toFixed(2);
  const verified = userData?.verified || userData?.is_verified || userData?.identity_status === 'Active';
  const rankMeta = getRankMeta(userData?.rank || 'frontline');
  const badgeProps = rankCodeToBadgeProps(rankMeta.code, { label: rankMeta.label });

  useEffect(() => setAvatarBroken(false), [avatarSrc]);
  const quickLinks = drawerMode ? DRAWER_QUICK_LINKS : QUICK_LINKS;

  return (
    <div className="hls-stack">
      {drawerMode ? null : (
      <section className="hls-card hls-profile-card">
        <div className="hls-avatar-wrap">
          <div className="hls-avatar-ring">
            {showAvatar ? (
              <img src={avatarSrc} alt={displayName} className="hls-avatar-img" onError={() => setAvatarBroken(true)} />
            ) : (
              <span className="hls-avatar-fallback">{displayName.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <span className="hls-level-badge">{level}</span>
        </div>

        <div className="hls-name-row">
          <h3 className="hls-username">{displayName}</h3>
          {verified ? <FiCheckCircle className="hls-verified-icon" aria-label="Verified member" /> : null}
        </div>
        <p className="hls-role">{userData?.headline || userData?.designation || 'Full Stack Developer'}</p>

        <div className="hls-rank-pill">
          <EventThonBadge
            tier={badgeProps.tier}
            label={badgeProps.label}
            variant="sm"
            className="hls-rank-badge"
            imgClassName="hls-rank-badge-img"
          />
          <span>{rankMeta.label}</span>
        </div>
        <div className="hls-xp-track">
          <div className="hls-xp-fill" style={{ width: '72%' }} />
        </div>

        <div className="hls-metric-row">
          <div><span className="hls-metric-label">XP Level</span><strong>{level}</strong></div>
          <div><span className="hls-metric-label">ET Power</span><strong>{etPower.toLocaleString()}</strong></div>
          <div><span className="hls-metric-label">Rank</span><strong>#{rankNo}</strong></div>
        </div>

        <div className="hls-social-row">
          <span><FiUsers /> 12 Squads</span>
          <span><FiUser /> 1.2K Followers</span>
          <span><FiCheckCircle /> 342 Connections</span>
        </div>
      </section>
      )}

      <section className="hls-card hls-wallet-card hls-wallet-card--soon">
        <div className="hls-wallet-soon-badge">Coming Soon</div>
        <h4 className="hls-section-title">EARNING WALLET</h4>
        <p className="hls-wallet-balance">
          Total Balance: <strong>{balance.toLocaleString()} ET Coins</strong>
        </p>
        <p className="hls-wallet-usd">≈ ${usdValue} USD</p>
        <WalletSparkline />
        <p className="hls-wallet-growth">Wallet features launching soon</p>
        <div className="hls-wallet-actions">
          <button type="button" className="hls-btn hls-btn-outline" disabled>Deposit</button>
          <button type="button" className="hls-btn hls-btn-primary" disabled>Withdraw</button>
        </div>
      </section>

      <section className="hls-card hls-streak-card">
        <h4 className="hls-section-title">DAILY STREAK</h4>
        <div className="hls-streak-head">
          <div className="hls-streak-flame" aria-hidden>🔥</div>
          <div>
            <p className="hls-streak-days">12 Days Streak</p>
          </div>
          <span className="hls-streak-xp">+80 XP</span>
        </div>
        <div className="hls-streak-week">
          {STREAK_DAYS.map((day, index) => (
            <div key={`${day.label}-${index}`} className={`hls-streak-node${day.done ? ' hls-streak-node--done' : ''}`}>
              {day.done ? <FiCheck /> : null}
              <small>{day.label}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="hls-card hls-links-card">
        <h4 className="hls-section-title">QUICK LINKS</h4>
        <nav className="hls-links-nav" aria-label="Quick links">
          {quickLinks.map(({ label, to, Icon }) => (
            <Link key={label} to={to} className="hls-link-row">
              <span className="hls-link-left">
                <Icon className="hls-link-icon" aria-hidden />
                {label}
              </span>
              <FiChevronRight className="hls-link-chevron" aria-hidden />
            </Link>
          ))}
        </nav>
      </section>
    </div>
  );
}
