import { useCompanyWorkspace } from '../context/CompanyWorkspaceContext';
import { useCompanyPortalStandalone } from './useCompanyPortalStandalone';

/** Prefer shared company workspace store; fallback when rendered outside the provider. */
export function useCompanyPortal() {
  const shared = useCompanyWorkspace();
  const standalone = useCompanyPortalStandalone();
  return shared || standalone;
}
