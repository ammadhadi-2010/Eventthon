import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { readStoredUserStub } from '../../../utils/storedUser';
import { isCompanyWorkspacePath } from './companyWorkspacePaths';

export const COMPANY_DASHBOARD_PATH = '/company/dashboard';

export function resolveCompanyHubAccess(user) {
  const role = String(user?.role || localStorage.getItem('userRole') || '').trim();
  const companyId = String(
    user?.company_id || user?.companyId || localStorage.getItem('companyId') || '',
  ).trim();
  if (!companyId) return false;
  return role === 'employer' || role === 'company';
}

export function readCompanyHubAccess(user) {
  return resolveCompanyHubAccess(user);
}

export function useCompanyHubAccess(user) {
  const location = useLocation();
  const [sessionUser, setSessionUser] = useState(() => readStoredUserStub());

  useEffect(() => {
    const syncSession = (event) => {
      if (event?.detail && typeof event.detail === 'object') {
        setSessionUser((prev) => ({ ...(prev || {}), ...event.detail }));
        return;
      }
      setSessionUser(readStoredUserStub());
    };
    window.addEventListener('et:profile-updated', syncSession);
    return () => window.removeEventListener('et:profile-updated', syncSession);
  }, []);

  const effectiveUser = user || sessionUser;
  const onCompanyHub = isCompanyWorkspacePath(location.pathname);
  const canAccessCompany = resolveCompanyHubAccess(effectiveUser);

  return {
    onCompanyHub,
    canAccessCompany,
    showSwitchToCompany: canAccessCompany && !onCompanyHub,
    showSwitchToMember: onCompanyHub,
    companyDashboardPath: COMPANY_DASHBOARD_PATH,
  };
}
