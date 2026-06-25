import { useLocation } from 'react-router-dom';
import { isAdminPreviewPath } from '../../Admin/layout/adminPreviewPaths';
import { isAdminControlPath, ADMIN_DASHBOARD_PATH } from '../../Admin/layout/adminWorkspacePaths';

function isAdminSession(user) {
  return user?.role === 'admin' || localStorage.getItem('userRole') === 'admin';
}

/** Show when admin is browsing member hubs (preview or direct routes), not admin management pages. */
export function shouldShowSwitchToAdmin(pathname = '', user) {
  if (!isAdminSession(user)) return false;
  if (isAdminPreviewPath(pathname)) return true;
  if (!isAdminControlPath(pathname)) return true;
  return false;
}

export default function useAdminHubAccess(user) {
  const { pathname } = useLocation();
  const showSwitchToAdmin = shouldShowSwitchToAdmin(pathname, user);

  return {
    showSwitchToAdmin,
    adminDashboardPath: ADMIN_DASHBOARD_PATH,
    onAdminHub: isAdminControlPath(pathname) && !isAdminPreviewPath(pathname),
  };
}