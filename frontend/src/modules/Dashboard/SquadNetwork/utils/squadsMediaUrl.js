import { API_BASE_URL } from '../../../../api/axiosConfig';

/** Resolve relative squad asset URLs against the configured API base. */
export function squadsAbsoluteUrl(url) {
  const raw = String(url || '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  const base = String(API_BASE_URL || '').replace(/\/+$/, '');
  return `${base}${raw.startsWith('/') ? raw : `/${raw}`}`;
}
