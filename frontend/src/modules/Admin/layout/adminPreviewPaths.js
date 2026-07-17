/** Admin preview route helpers — keep user views inside the admin shell. */

export const ADMIN_PREVIEW_BASE = '/admin-control/preview';
export const ADMIN_PREVIEW_ALIAS = '/admin/preview';

export const ADMIN_MONITOR_SECTIONS = [
  { name: 'Home', section: 'home', userPath: '/dashboard' },
  { name: 'Squads', section: 'squads', userPath: '/squads' },
  { name: 'Projects', section: 'projects', userPath: '/projects' },
  { name: 'Gigs', section: 'gigs', userPath: '/gigs' },
  { name: 'Jobs', section: 'jobs', userPath: '/jobs' },
];

export function isAdminContextPath(pathname = '') {
  const path = String(pathname || '');
  return (
    path.startsWith('/admin-control') ||
    path.startsWith('/admin/dashboard') ||
    path.startsWith('/admin/preview')
  );
}

export function isAdminPreviewPath(pathname = '') {
  const path = String(pathname || '');
  return path.startsWith('/admin-control/preview') || path.startsWith('/admin/preview');
}

export function adminPreviewPath(section) {
  return `${ADMIN_PREVIEW_ALIAS}/${section}`;
}

export function resolveMonitorTabPath(tab, pathname = '') {
  if (isAdminContextPath(pathname)) {
    return adminPreviewPath(tab.section);
  }
  return tab.userPath;
}

const ADMIN_HUB_MANAGEMENT_PATHS = {
  squads: '/admin-control/squads',
  projects: '/admin-control/projects',
  gigs: '/admin-control/gigs',
  jobs: '/admin-control/jobs',
};

const ADMIN_HOME_PATHS = new Set([
  '/admin-control',
  '/admin-control/dashboard',
  '/admin/dashboard',
]);

function isAdminHubManagementActive(section, pathname = '') {
  if (section === 'home') {
    return ADMIN_HOME_PATHS.has(pathname);
  }
  const base = ADMIN_HUB_MANAGEMENT_PATHS[section];
  if (!base) return false;
  return pathname === base || pathname.startsWith(`${base}/`);
}

export function isMonitorTabActive(tab, pathname = '') {
  const path = String(pathname || '');
  if (isAdminPreviewPath(path)) {
    return parseAdminPreviewSection(path) === tab.section;
  }
  if (isAdminContextPath(path)) {
    return isAdminHubManagementActive(tab.section, path);
  }
  return path === tab.userPath || path.startsWith(`${tab.userPath}/`);
}

export function parseAdminPreviewSection(pathname = '') {
  const path = String(pathname || '');
  const aliasPrefix = `${ADMIN_PREVIEW_ALIAS}/`;
  const controlPrefix = `${ADMIN_PREVIEW_BASE}/`;
  let tail = '';
  if (path.startsWith(aliasPrefix)) tail = path.slice(aliasPrefix.length);
  else if (path.startsWith(controlPrefix)) tail = path.slice(controlPrefix.length);
  else return '';
  return tail.split('/').filter(Boolean)[0] || '';
}
