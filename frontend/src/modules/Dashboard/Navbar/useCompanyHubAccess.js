import { useLocation } from 'react-router-dom';
import { isCompanyWorkspacePath } from './companyWorkspacePaths';

export const COMPANY_DASHBOARD_PATH = '/company/dashboard';

export function readCompanyHubAccess() {
  const userRole = localStorage.getItem('userRole');
  const companyId = localStorage.getItem('companyId');
  return userRole === 'employer' && Boolean(companyId);
}

export function useCompanyHubAccess() {
  const location = useLocation();
  const onCompanyHub = isCompanyWorkspacePath(location.pathname);
  const canAccessCompany = readCompanyHubAccess();

  return {
    onCompanyHub,
    canAccessCompany,
    showSwitchToCompany: canAccessCompany && !onCompanyHub,
    showSwitchToMember: onCompanyHub,
    companyDashboardPath: COMPANY_DASHBOARD_PATH,
  };
}
