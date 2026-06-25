const CACHE_KEY = 'et:company-workspace-cache';

export function resolveCompanyPortalUserId() {
  return (
    localStorage.getItem('userEmail') ||
    localStorage.getItem('userMobile') ||
    localStorage.getItem('user_id') ||
    ''
  );
}

function cacheScope() {
  return {
    companyId: localStorage.getItem('companyId') || '',
    userId: resolveCompanyPortalUserId(),
  };
}

export function readCompanyWorkspaceCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const scope = cacheScope();
    if (parsed.companyId !== scope.companyId || parsed.userId !== scope.userId) return null;
    return parsed.data || null;
  } catch {
    return null;
  }
}

export function writeCompanyWorkspaceCache(data) {
  if (!data) return;
  try {
    const scope = cacheScope();
    sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        ...scope,
        data,
        at: Date.now(),
      }),
    );
  } catch {
    /* ignore quota errors */
  }
}

export function patchCompanyWorkspaceCacheCompany(nextCompany) {
  if (!nextCompany) return;
  const cached = readCompanyWorkspaceCache();
  if (!cached) return;
  writeCompanyWorkspaceCache({
    ...cached,
    company: { ...(cached.company || {}), ...nextCompany },
  });
}

export function clearCompanyWorkspaceCache() {
  try {
    sessionStorage.removeItem(CACHE_KEY);
  } catch {
    /* ignore */
  }
}
