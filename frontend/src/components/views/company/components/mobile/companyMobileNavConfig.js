import { FiBell, FiBriefcase, FiClipboard, FiHome, FiLayers, FiUsers } from 'react-icons/fi';

/** Same colorful hub strip as member — company Home / Jobs / Alerts stay in employer workspace. */
export const COMPANY_MOBILE_NAV = [
  { key: 'home', label: 'Home', path: '/company/dashboard', Icon: FiHome },
  { key: 'squads', label: 'Squads', path: '/squads', Icon: FiUsers },
  { key: 'projects', label: 'Projects', path: '/projects', Icon: FiBriefcase },
  { key: 'gigs', label: 'Gigs', path: '/gigs', Icon: FiLayers },
  { key: 'jobs', label: 'Jobs', path: '/company/dashboard/jobs', Icon: FiClipboard },
  { key: 'alerts', label: 'Alerts Hub', path: '/company/notifications', Icon: FiBell },
];

export function isCompanyMobileNavActive(pathname, path) {
  if (path === '/company/dashboard') {
    return pathname === '/company/dashboard' || pathname === '/company/dashboard/';
  }
  if (path === '/company/dashboard/jobs') {
    return (
      pathname.startsWith('/company/dashboard/jobs') ||
      pathname.startsWith('/company/dashboard/applications') ||
      pathname.startsWith('/company/dashboard/draft-jobs')
    );
  }
  if (path === '/company/notifications') {
    return pathname.startsWith('/company/notifications') || pathname.startsWith('/company/alerts');
  }
  return pathname.startsWith(path);
}
