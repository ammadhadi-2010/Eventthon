import { API_BASE_URL } from '../../../api/axiosConfig';

/** Standard profile / preview image from API payload (imageurl first). */
export function pickImageurl(entity) {
  if (!entity) return '';
  const url = String(
    entity.imageurl ||
      entity.imageUrl ||
      entity.image_url ||
      entity.profile_image_url ||
      entity.profileImage ||
      entity.avatar ||
      entity.banner ||
      entity.cover_preview ||
      '',
  ).trim();
  return url;
}

export function appendMediaCacheBust(url, seed) {
  const clean = String(url || '').trim();
  if (!clean || clean.startsWith('blob:') || clean.startsWith('data:')) return clean;
  const cacheKey = String(
    seed ||
      (typeof window !== 'undefined' ? localStorage.getItem('userMediaVersion') : '') ||
      '',
  ).trim();
  if (!cacheKey) return clean;
  const separator = clean.includes('?') ? '&' : '?';
  return `${clean}${separator}v=${encodeURIComponent(cacheKey)}`;
}

export function resolveDashboardMediaUrl(raw, cacheSeed) {
  const v = pickImageurl({ imageurl: raw }) || String(raw || '').trim();
  if (!v || v.includes('ep-live-preview')) return '';
  if (v.startsWith('http') || v.startsWith('blob:') || v.startsWith('data:')) {
    return appendMediaCacheBust(v, cacheSeed);
  }
  const resolved = `${API_BASE_URL}${v.startsWith('/') ? v : `/${v}`}`;
  return appendMediaCacheBust(resolved, cacheSeed);
}

export function getUserDisplayName(user) {
  const first = `${user?.first_name || ''} ${user?.last_name || ''}`.trim();
  if (first && !['user', 'eventthon member'].includes(first.toLowerCase())) return first;
  const username = String(user?.username || '').trim();
  if (username) return username;
  if (user?.name) return String(user.name);
  const email = user?.email || '';
  if (email.includes('@')) return email.split('@')[0];
  return 'Member';
}
