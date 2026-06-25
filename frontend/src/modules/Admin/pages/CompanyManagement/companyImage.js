import { API_BASE_URL } from '../../../../api/axiosConfig';
import { companyAvatar } from './companyData';

export function resolveCompanyImageurl(imageurl, name = '') {
  const raw = String(imageurl || '').trim();
  if (!raw) return companyAvatar(name);
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  const base = String(API_BASE_URL || '').replace(/\/+$/, '');
  const path = raw.startsWith('/') ? raw : `/${raw}`;
  return `${base}${path}`;
}
