import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiBriefcase, FiClipboard, FiHome, FiUsers } from 'react-icons/fi';
import useScrollHideNavbar from '../hooks/useScrollHideNavbar';
import {
  ADMIN_MONITOR_SECTIONS,
  isMonitorTabActive,
  resolveMonitorTabPath,
} from './adminPreviewPaths';
import { monitorTabStyle } from './adminMonitorTabThemes';
import './admin-mobile-bottom-nav.css';

const TAB_ICONS = {
  home: FiHome,
  squads: FiUsers,
  projects: FiBriefcase,
  gigs: FiBriefcase,
  jobs: FiClipboard,
};

export default function AdminMobileBottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { hidden: navHidden } = useScrollHideNavbar(true);

  return (
    <nav
      className={`admin-mobile-bottom-nav lg:hidden flex h-16 flex-nowrap items-stretch justify-around px-1${
        navHidden ? ' admin-mobile-bottom-nav--scroll-hidden' : ''
      }`}
      aria-label="Admin hub navigation"
    >
      {ADMIN_MONITOR_SECTIONS.map((tab) => {
        const Icon = TAB_ICONS[tab.section] || FiBriefcase;
        const targetPath = resolveMonitorTabPath(tab, pathname);
        const active = isMonitorTabActive(tab, pathname);
        const theme = monitorTabStyle(tab.section, active);

        return (
          <button
            key={tab.section}
            type="button"
            className={`admin-mobile-bottom-nav__item flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 border-0 bg-transparent px-0.5 py-1.5 text-[10px] font-extrabold leading-tight${
              active ? ' admin-mobile-bottom-nav__item--active' : ''
            }`}
            style={{ color: theme.color }}
            onClick={() => navigate(targetPath)}
            aria-current={active ? 'page' : undefined}
          >
            <Icon size={18} className="shrink-0" aria-hidden />
            <span className="max-w-full truncate text-[10px]">{tab.name}</span>
          </button>
        );
      })}
    </nav>
  );
}
