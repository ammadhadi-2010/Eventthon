const MARKETING_PATHS = new Set(['about', 'pricing', 'careers', 'contact', 'privacy', 'terms']);

/** Footer marketing pages at /company/about etc. */
export function isCompanyMarketingPath(pathname = '') {
  const parts = String(pathname || '').split('/').filter(Boolean);
  return parts[0] === 'company' && parts[1] && MARKETING_PATHS.has(parts[1]);
}

/** Employer company hub shell (navbar + sidebar layout). */
export function isCompanyWorkspacePath(pathname = '') {
  const path = String(pathname || '');
  if (path.startsWith('/company-hub')) return true;
  if (path.startsWith('/company-panel')) return true;
  if (!path.startsWith('/company/')) return false;
  if (isCompanyMarketingPath(path)) return false;
  return (
    path.startsWith('/company/dashboard') ||
    path.startsWith('/company/messages') ||
    path.startsWith('/company/notifications')
  );
}

/** Hide main Company Panel sidebar; keep internal chat/alert sidebars. */
export function isCompanyCommsFullBleedPath(pathname = '') {
  const path = String(pathname || '');
  return path.startsWith('/company/messages') || path.startsWith('/company/notifications');
}
