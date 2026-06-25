import { API_BASE_URL } from '../../../../api/axiosConfig';

export function resolveAdminChatAvatar(imageurl, name = '') {
  const raw = String(imageurl || '').trim();
  if (!raw) {
    const letter = String(name || 'E').trim().charAt(0).toUpperCase() || 'E';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(letter)}&background=1e293b&color=fff`;
  }
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  const base = String(API_BASE_URL || '').replace(/\/+$/, '');
  const path = raw.startsWith('/') ? raw : `/${raw}`;
  return `${base}${path}`;
}

export function formatChatTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
