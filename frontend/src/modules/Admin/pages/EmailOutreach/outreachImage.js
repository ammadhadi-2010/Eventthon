import { API_BASE_URL } from '../../../../api/axiosConfig';

export function leadLetterAvatar(name = '') {
  const text = encodeURIComponent(String(name || 'Lead').slice(0, 2).toUpperCase());
  return `https://ui-avatars.com/api/?name=${text}&background=6366f1&color=fff&size=64`;
}

export function resolveLeadImageurl(imageurl, company = '') {
  const raw = String(imageurl || '').trim();
  if (!raw) return leadLetterAvatar(company);
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  const base = String(API_BASE_URL || '').replace(/\/+$/, '');
  const path = raw.startsWith('/') ? raw : `/${raw}`;
  return `${base}${path}`;
}
