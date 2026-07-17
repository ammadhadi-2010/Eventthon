import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiBell, FiBriefcase, FiClipboard, FiHome, FiUsers } from 'react-icons/fi';
import './dashboard-mobile-bottom-nav.css';

const NAV_ITEMS = [
  { key: 'home', label: 'Home', path: '/dashboard', Icon: FiHome },
  { key: 'squads', label: 'Squads', path: '/squads', Icon: FiUsers },
  { key: 'projects', label: 'Projects', path: '/projects', Icon: FiBriefcase },
  { key: 'gigs', label: 'Gigs', path: '/gigs', Icon: FiBriefcase },
  { key: 'jobs', label: 'Jobs', path: '/jobs', Icon: FiClipboard },
  { key: 'alerts', label: 'Alerts Hub', path: '/notifications/alerts', Icon: FiBell },
];

function isNavActive(pathname, path) {
  if (path === '/dashboard') return pathname === '/dashboard' || pathname === '/';
  return pathname.startsWith(path);
}

export default function DashboardMobileBottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return (
    <nav
      className="dash-mobile-bottom-nav"
      aria-label="Mobile dashboard navigation"
    >
      {NAV_ITEMS.map(({ key, label, path, Icon }) => {
        const active = isNavActive(pathname, path);
        return (
          <button
            key={key}
            type="button"
            data-nav={key}
            className={`dash-mobile-bottom-nav__item${active ? ' dash-mobile-bottom-nav__item--active' : ''}`}
            onClick={() => navigate(path)}
            aria-current={active ? 'page' : undefined}
          >
            <Icon size={18} aria-hidden />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
