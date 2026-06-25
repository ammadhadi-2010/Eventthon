export const GIGS_HUB_PATH = '/gigs';

export function resolveGigCategoryHref(category = '') {
  const label = String(category || '').trim();
  if (!label) return GIGS_HUB_PATH;
  if (label.toLowerCase() === 'featured') return '/gigs/browse/featured';
  if (label.toLowerCase() === 'recent') return GIGS_HUB_PATH;
  return `/gigs/providers?category=${encodeURIComponent(label)}`;
}

export function truncateBreadcrumbTitle(title = '', max = 24) {
  const text = String(title || '').trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max)}...`;
}
