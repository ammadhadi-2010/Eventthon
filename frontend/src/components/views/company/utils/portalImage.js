import { API_BASE_URL } from '../../../../api/axiosConfig';

export function resolvePortalImageurl(imageurl, name = '') {
  const raw = String(imageurl || '').trim();
  if (!raw) {
    const text = encodeURIComponent((name || 'Co').slice(0, 2).toUpperCase());
    return `https://ui-avatars.com/api/?name=${text}&background=6366f1&color=fff&size=128`;
  }
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  const base = String(API_BASE_URL || '').replace(/\/+$/, '');
  const path = raw.startsWith('/') ? raw : `/${raw}`;
  return `${base}${path}`;
}
