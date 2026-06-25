import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiBell, FiBriefcase, FiClipboard, FiHome, FiUsers } from 'react-icons/fi';
import { useScrollDirection } from '../../../../hooks/useScrollDirection';
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
  const scrollDirection = useScrollDirection();
  const isJobsHub = pathname.startsWith('/jobs');
  const isGigsHub = pathname.startsWith('/gigs');
  const isProjectsHub = pathname.startsWith('/projects');
  const isAlertsHub = pathname.startsWith("/notifications");
  const isMessagesHub = pathname.startsWith("/messages");
  const isHomeHub = pathname === '/dashboard' || pathname === '/';
  const isUpdatesHub = pathname.startsWith('/updates');
  const isSquadsHub = pathname.startsWith('/squads');
  const isViewAllHub = pathname.startsWith('/profile/connections');
  const isProfileHub = pathname === '/profile' || pathname === '/profile/';
  const isEditProfileHub = pathname === '/profile/edit' || pathname.startsWith('/profile/edit/');
  const isViewFullProfileHub = pathname === '/profile/view' || pathname.startsWith('/profile/view/');
  const hidden =
    (isJobsHub || isGigsHub || isProjectsHub || isAlertsHub || isMessagesHub || isHomeHub || isUpdatesHub || isSquadsHub || isViewAllHub || isProfileHub || isEditProfileHub || isViewFullProfileHub) &&
    scrollDirection === "down";

  return (
    <nav
      className={`dash-mobile-bottom-nav${hidden ? ' dash-mobile-bottom-nav--hidden' : ''}`}
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
