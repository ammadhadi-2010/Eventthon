import React, { useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Bell,
  LayoutDashboard,
  Link2,
  MessageCircle,
  PenSquare,
  UserCheck,
  UserPlus,
  UsersRound,
} from 'lucide-react';
import { API_BASE_URL } from '../../../../api/axiosConfig';
import { viewAllHrefForSidebarKey } from './connectionsListConfig';

function fmtCount(n) {
  const x = Math.max(0, Math.floor(Number(n) || 0));
  if (x >= 1000) return `${(x / 1000).toFixed(1)}K`.replace('.0K', 'K');
  return String(x);
}

function resolveAvatar(raw, email) {
  const v = String(raw || '').trim();
  if (!v) return `https://api.dicebear.com/8.x/avataaars/svg?seed=${encodeURIComponent(email || 'me')}`;
  if (v.startsWith('http') || v.startsWith('blob:')) return v;
  return `${API_BASE_URL}${v.startsWith('/') ? v : `/${v}`}`;
}

const NAV = [
  { to: '/profile', label: 'Overview', end: true, Icon: LayoutDashboard },
  { to: '/profile/edit', label: 'Edit profile', end: false, Icon: PenSquare },
  { to: '/squads', label: 'Squads', end: false, Icon: UsersRound },
  {
    to: viewAllHrefForSidebarKey('connections'),
    label: 'Connections',
    end: false,
    matchPrefix: '/profile/connections',
    Icon: Link2,
  },
  { to: viewAllHrefForSidebarKey('followers'), label: 'Followers', end: false, Icon: UserPlus },
  { to: viewAllHrefForSidebarKey('following'), label: 'Following', end: false, Icon: UserCheck },
  { to: '/messages', label: 'Messages', end: false, badge: 5, Icon: MessageCircle },
  { to: '/notifications', label: 'Notifications', end: false, badge: 3, Icon: Bell },
];

/**
 * Left column shared by all `/profile/connections/*` list views.
 */
export default function ConnectionsNavSidebar({ userData, stats = {}, onNavigate }) {
  const loc = useLocation();

  const display = useMemo(
    () =>
      userData?.name ||
      [userData?.first_name, userData?.last_name].filter(Boolean).join(' ') ||
      'Developer',
    [userData],
  );
  const title = userData?.headline || userData?.role || 'Full Stack Developer';
  const av = resolveAvatar(
    userData?.imageurl || userData?.profile_image_url || userData?.avatar,
    userData?.email,
  );

  const s = {
    commanders: stats.top_commanders ?? 8,
    mutual: stats.connections_mutual ?? 24,
    followers: stats.followers ?? 12400,
    following: stats.following ?? 342,
    connections: stats.connections ?? 1200,
  };

  return (
    <aside className="cp-nav">
      <div className="cp-nav__profile">
        <img className="cp-nav__av" src={av} alt="" />
        <div className="cp-nav__who">
          <div className="cp-nav__name">
            {display}
            <span className="cp-nav__verified" title="Verified">
              ✓
            </span>
          </div>
          <div className="cp-nav__title">{title}</div>
        </div>
        <NavLink to="/profile" className="cp-nav__cta" onClick={() => onNavigate?.()}>
          View Public Profile
        </NavLink>
      </div>

      <nav className="cp-nav__menu" aria-label="Profile sections">
        {NAV.map((item) => {
          const Icon = item.Icon;
          return (
            <NavLink
              key={`${item.label}-${item.to}`}
              to={item.to}
              end={item.end}
              onClick={() => onNavigate?.()}
              className={({ isActive }) => {
                if (item.matchPrefix) {
                  return loc.pathname.startsWith(item.matchPrefix) ? 'cp-nav__link is-active' : 'cp-nav__link';
                }
                return `cp-nav__link${isActive ? ' is-active' : ''}`;
              }}
            >
              <span className="cp-nav__link-inner">
                <Icon size={17} strokeWidth={1.75} className="cp-nav__ico" aria-hidden />
                <span>{item.label}</span>
              </span>
              {item.badge != null ? <span className="cp-nav__badge">{item.badge}</span> : null}
            </NavLink>
          );
        })}
      </nav>

      <section className="cp-nav__network">
        <h3 className="cp-nav__network-title">Your Network</h3>
        <ul className="cp-nav__network-list">
          <li>
            <NavLink to={viewAllHrefForSidebarKey('commanders')} className="cp-nav__netlink" onClick={() => onNavigate?.()}>
              Top Commanders <span>{fmtCount(s.commanders)}</span>
            </NavLink>
          </li>
          <li>
            <NavLink to={viewAllHrefForSidebarKey('mutual')} className="cp-nav__netlink" onClick={() => onNavigate?.()}>
              Mutual Connections <span>{fmtCount(s.mutual)}</span>
            </NavLink>
          </li>
          <li>
            <NavLink to={viewAllHrefForSidebarKey('followers')} className="cp-nav__netlink" onClick={() => onNavigate?.()}>
              Followers <span>{fmtCount(s.followers)}</span>
            </NavLink>
          </li>
          <li>
            <NavLink to={viewAllHrefForSidebarKey('following')} className="cp-nav__netlink" onClick={() => onNavigate?.()}>
              Following <span>{fmtCount(s.following)}</span>
            </NavLink>
          </li>
          <li>
            <NavLink to={viewAllHrefForSidebarKey('connections')} className="cp-nav__netlink" onClick={() => onNavigate?.()}>
              Connections <span>{fmtCount(s.connections)}</span>
            </NavLink>
          </li>
        </ul>
      </section>

      <div className="cp-nav__grow">
        <div className="cp-nav__grow-title">Grow Your Network</div>
        <p className="cp-nav__grow-copy">Connect with more developers and expand your squad reach.</p>
        <NavLink to="/dashboard" className="cp-nav__grow-btn" onClick={() => onNavigate?.()}>
          Find People
        </NavLink>
      </div>
    </aside>
  );
}
