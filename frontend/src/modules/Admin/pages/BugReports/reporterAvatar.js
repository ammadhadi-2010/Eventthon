import { API_BASE_URL } from '../../../../api/axiosConfig';

export function resolveReporterImageurl(imageurl, name = '') {
  const raw = String(imageurl || '').trim();
  if (!raw) {
    const text = encodeURIComponent((name || 'U').slice(0, 2).toUpperCase());
    return `https://ui-avatars.com/api/?name=${text}&background=ef4444&color=fff&size=96`;
  }
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  const base = String(API_BASE_URL || '').replace(/\/+$/, '');
  const path = raw.startsWith('/') ? raw : `/${raw}`;
  return `${base}${path}`;
}
