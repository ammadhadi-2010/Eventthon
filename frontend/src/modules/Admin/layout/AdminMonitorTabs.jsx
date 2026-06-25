import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiBriefcase, FiHome, FiUsers } from 'react-icons/fi';
import {
  ADMIN_MONITOR_SECTIONS,
  isMonitorTabActive,
  resolveMonitorTabPath,
} from './adminPreviewPaths';
import { monitorTabStyle } from './adminMonitorTabThemes';

const TAB_ICONS = {
  home: FiHome,
  squads: FiUsers,
  projects: FiBriefcase,
  gigs: FiBriefcase,
  jobs: FiBriefcase,
};

export default function AdminMonitorTabs() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="agn-monitor" aria-label="Platform monitoring">
      {ADMIN_MONITOR_SECTIONS.map((tab) => {
        const Icon = TAB_ICONS[tab.section] || FiBriefcase;
        const targetPath = resolveMonitorTabPath(tab, pathname);
        const active = isMonitorTabActive(tab, pathname);
        const style = monitorTabStyle(tab.section, active);
        return (
          <button
            key={tab.section}
            type="button"
            className={`agn-monitor__tab${active ? ' is-active' : ''}`}
            style={style}
            onClick={() => navigate(targetPath)}
          >
            <Icon size={15} aria-hidden style={{ color: style.color }} />
            <span>{tab.name}</span>
          </button>
        );
      })}
    </nav>
  );
}
