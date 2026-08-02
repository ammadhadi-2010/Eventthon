import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiBookmark, FiCheck, FiCheckCircle, FiChevronRight, FiClipboard, FiCreditCard,
  FiHeart, FiHelpCircle, FiSettings, FiUsers, FiUser,
} from 'react-icons/fi';
import EventThonBadge from '../../../components/EventThonBadge';
import { rankCodeToBadgeProps } from '../../../components/badgeTierProps';
import { getRankMeta } from '../../Admin/pages/UserManagement/userManagementData';
import { getUserDisplayName, pickImageurl, resolveDashboardMediaUrl } from '../utils/dashboardMedia';
import { hasStoredSession } from '../../../utils/storedUser';
import { useHomeSidebarMetrics, formatSidebarCount } from '../hooks/useHomeSidebarMetrics';
import InviteFriendsSection from './InviteFriendsSection';
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
  { label: '❤️ Donate', to: '/donate', Icon: FiHeart },
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

const DRAWER_QUICK_LINKS = [
  { label: 'Profile', to: '/profile', Icon: FiUser },
  { label: 'Wallet', to: '/wallet', Icon: FiCreditCard },
  { label: 'Settings', to: '/dashboard/settings', Icon: FiSettings },
  { label: 'Help', to: '/resources/help', Icon: FiHelpCircle },
  { label: '❤️ Donate', to: '/donate', Icon: FiHeart },
];

export default function HomeLeftSidebar({ userData, drawerMode = false }) {
  const [avatarBroken, setAvatarBroken] = useState(false);
  const { metrics } = useHomeSidebarMetrics(userData);
  const displayName = getUserDisplayName(userData) || 'Anonymous User';
  const avatarSrc = resolveDashboardMediaUrl(pickImageurl(userData));
  const bannerSrc = resolveDashboardMediaUrl(userData?.banner || userData?.cover_image || userData?.coverImageUrl || '');
  const showAvatar = Boolean(avatarSrc) && !avatarBroken;
  const xpLevel = Math.max(1, Math.floor(metrics.xp / 500) + 1);
  const thonBalance = metrics.thonBalance;
  const usdValue = (thonBalance / 100).toFixed(2);
  const verified = userData?.verified || userData?.is_verified || userData?.identity_status === 'Active';
  const rankMeta = getRankMeta(userData?.rank || 'frontline');
  const badgeProps = rankCodeToBadgeProps(rankMeta.code, { label: rankMeta.label });

  useEffect(() => setAvatarBroken(false), [avatarSrc]);
  const quickLinks = drawerMode ? DRAWER_QUICK_LINKS : QUICK_LINKS;

  return (
    <div className="hls-stack">
      {drawerMode ? null : (
      <section className="hls-card hls-profile-card">
        <div
          className={`hls-profile-banner${bannerSrc ? ' hls-profile-banner--image' : ''}`}
          style={bannerSrc ? { backgroundImage: `url(${bannerSrc})` } : undefined}
          aria-hidden
        />

        <Link to="/profile" className="hls-profile-card-link" aria-label="Open your profile">
        <div className="hls-avatar-wrap">
          <div className="hls-avatar-ring">
            {showAvatar ? (
              <img src={avatarSrc} alt={displayName} className="hls-avatar-img" onError={() => setAvatarBroken(true)} />
            ) : (
              <span className="hls-avatar-fallback">{displayName.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <span className="hls-level-badge">{xpLevel}</span>
        </div>

        <div className="hls-name-row">
          <h3 className="hls-username">{displayName}</h3>
          {verified ? <FiCheckCircle className="hls-verified-icon" aria-label="Verified member" /> : null}
        </div>
        </Link>
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
          <div className="hls-xp-fill" style={{ width: `${metrics.xpProgressPct || 0}%` }} />
        </div>

        <div className="hls-metric-row">
          <div><span className="hls-metric-label">XP</span><strong>{metrics.xp.toLocaleString()}</strong></div>
          <div><span className="hls-metric-label">Thon</span><strong>{formatSidebarCount(thonBalance)}</strong></div>
          <div><span className="hls-metric-label">Rank</span><strong>{rankMeta.label.split(' ')[0]}</strong></div>
        </div>

        <div className="hls-social-row">
          <span><FiUsers /> {formatSidebarCount(metrics.squads)} Squads</span>
          <span><FiUser /> {formatSidebarCount(metrics.followers)} Followers</span>
          <span><FiCheckCircle /> {formatSidebarCount(metrics.connections)} Connections</span>
        </div>

        <Link to="/profile" className="hls-view-profile-btn">
          View Profile
        </Link>
      </section>
      )}

      <section className="hls-card hls-wallet-card">
        <div className="hls-wallet-head">
          <h4 className="hls-section-title">Earning Wallet</h4>
          <span className="hls-wallet-chip">Thon</span>
        </div>
        <p className="hls-wallet-balance-label">Total Balance</p>
        <p className="hls-wallet-balance">
          <strong>{thonBalance.toLocaleString()}</strong>
          <span className="hls-wallet-unit">Thon</span>
        </p>
        <p className="hls-wallet-usd">≈ ${usdValue} USD</p>
        {thonBalance > 0 ? (
          <>
            <WalletSparkline />
            <p className="hls-wallet-growth">Available Thon balance</p>
          </>
        ) : (
          <p className="hls-wallet-growth">No Thon balance yet — complete gigs or deposits to earn.</p>
        )}
        <div className="hls-wallet-actions">
          <Link to="/wallet" className="hls-btn hls-btn-outline">Deposit</Link>
          <Link to="/wallet" className="hls-btn hls-btn-primary">Withdraw</Link>
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

      {!drawerMode ? (
        <Link to="/donate" className="hls-donate-card">
          <span className="hls-donate-card__icon" aria-hidden>❤️</span>
          <div>
            <strong>Donate &amp; Support</strong>
            <p>Give to verified causes through EventThon</p>
          </div>
          <FiChevronRight className="hls-donate-card__chev" aria-hidden />
        </Link>
      ) : null}

      {hasStoredSession() && !drawerMode ? (
        <InviteFriendsSection userData={userData} />
      ) : null}
    </div>
  );
}
