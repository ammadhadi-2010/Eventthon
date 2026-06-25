/** Admin panel route helpers for layout and navbar switching. */

export function isAdminControlPath(pathname = '') {
  const path = String(pathname || '');
  return (
    path.startsWith('/admin-control') ||
    path.startsWith('/admin/dashboard') ||
    path.startsWith('/admin/preview')
  );
}

/** Hide left admin sidebar — full-width chat and notifications. */
export function isAdminFullBleedPath(pathname = '') {
  const path = String(pathname || '');
  return (
    path.startsWith('/admin-control/chat') ||
    path.startsWith('/admin-control/notifications') ||
    path.startsWith('/admin/chat') ||
    path.startsWith('/admin/notifications')
  );
}

export const ADMIN_DASHBOARD_PATH = '/admin-control';
export const ADMIN_DASHBOARD_ALIAS = '/admin/dashboard';
export const ADMIN_SYSTEM_HEALTH_PATH = '/admin-control/system-health';
export const ADMIN_SYSTEM_HEALTH_ALIAS = '/admin/system-health';
export const ADMIN_TRANSACTIONS_PATH = '/admin-control/transactions';
export const ADMIN_TRANSACTIONS_ALIAS = '/admin/transactions';
export const ADMIN_ACTIVITIES_PATH = '/admin-control/activities';
export const ADMIN_ACTIVITIES_ALIAS = '/admin/activities';
export const ADMIN_COUNTRIES_ANALYTICS_PATH = '/admin-control/analytics/countries';
export const ADMIN_COUNTRIES_ANALYTICS_ALIAS = '/admin/analytics/countries';
export const ADMIN_PROFILE_PATH = '/admin-control/profile';
export const ADMIN_PROFILE_ALIAS = '/admin/profile';
