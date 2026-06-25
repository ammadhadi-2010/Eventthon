import { readCompanyWorkspaceCache, writeCompanyWorkspaceCache } from '../utils/companyWorkspaceCache';
import { fetchCompanyPortalDashboard } from './companyPortalApi';

let inflight = null;

/** Warm company dashboard payload before navigation (no-op if cached or in flight). */
export function prefetchCompanyPortalDashboard() {
  const cached = readCompanyWorkspaceCache();
  if (cached) return Promise.resolve(cached);
  if (inflight) return inflight;
  inflight = fetchCompanyPortalDashboard()
    .then((payload) => {
      writeCompanyWorkspaceCache(payload);
      return payload;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}
