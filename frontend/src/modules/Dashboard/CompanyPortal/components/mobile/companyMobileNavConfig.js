import { FiBarChart2, FiBriefcase, FiHome, FiSettings, FiUsers } from 'react-icons/fi';

export const COMPANY_MOBILE_NAV = [
  { key: 'home', label: 'Home', path: '/company/dashboard', Icon: FiHome },
  { key: 'squads', label: 'Squads', path: '/squads', Icon: FiUsers },
  { key: 'gigs', label: 'Gigs', path: '/gigs', Icon: FiBriefcase },
  {
    key: 'analytics',
    label: 'Analytics',
    path: '/company/dashboard/coming-soon/analytics',
    Icon: FiBarChart2,
  },
  { key: 'settings', label: 'Settings', path: '/company/dashboard/settings', Icon: FiSettings },
];

export function isCompanyMobileNavActive(pathname, path) {
  if (path === '/company/dashboard') {
    return pathname === '/company/dashboard' || pathname === '/company/dashboard/';
  }
  return pathname.startsWith(path);
}
