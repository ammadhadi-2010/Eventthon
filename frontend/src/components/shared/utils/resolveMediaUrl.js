import { API_BASE_URL } from '../../../api/axiosConfig';

/** Prefix relative API paths with API base; pass through absolute URLs. */
export function resolveMediaUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const v = url.trim();
  if (!v) return '';
  if (v.startsWith('http') || v.startsWith('blob:')) return v;
  return `${API_BASE_URL}${v.startsWith('/') ? v : `/${v}`}`;
}
