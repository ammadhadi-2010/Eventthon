import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiBriefcase, FiClipboard, FiHome, FiUsers } from 'react-icons/fi';
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

export default function AdminMobileBottomNav({ hidden = false }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav
      className={`admin-mobile-bottom-nav lg:hidden${hidden ? ' admin-mobile-bottom-nav--scroll-hidden' : ''}`}
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
            className={`admin-mobile-bottom-nav__item${active ? ' admin-mobile-bottom-nav__item--active' : ''}`}
            style={{ color: active ? theme.color : theme.color }}
            onClick={() => navigate(targetPath)}
            aria-current={active ? 'page' : undefined}
          >
            <Icon size={18} aria-hidden />
            <span>{tab.name}</span>
          </button>
        );
      })}
    </nav>
  );
}
