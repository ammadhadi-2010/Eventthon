/** Hub drawer toggle — global navbar logo can open hub-specific mobile drawers. */

import { parseAdminPreviewSection } from '../../Admin/layout/adminPreviewPaths';

const HUB_DRAWER_EVENT = 'et:hub-toggle-drawer';

export function resolveHubFromPath(pathname = '') {
  const path = String(pathname || '');
  if (path.startsWith('/admin/preview/') || path.startsWith('/admin-control/preview/')) {
    const section = parseAdminPreviewSection(path);
    return section || '';
  }
  if (path === '/dashboard' || path === '/') return 'home';
  if (path.startsWith('/squads')) return 'squads';
  if (path.startsWith('/projects')) return 'projects';
  if (path.startsWith('/gigs')) return 'gigs';
  if (path.startsWith('/jobs')) return 'jobs';
  return '';
}

export function dispatchHubDrawerToggle(hub) {
  if (!hub) return;
  window.dispatchEvent(new CustomEvent(HUB_DRAWER_EVENT, { detail: { hub } }));
}

export function subscribeHubDrawerToggle(hub, handler) {
  const listener = (event) => {
    if (event?.detail?.hub === hub) handler();
  };
  window.addEventListener(HUB_DRAWER_EVENT, listener);
  return () => window.removeEventListener(HUB_DRAWER_EVENT, listener);
}
