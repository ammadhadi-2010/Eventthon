import { resolveMediaUrl } from '../../../../components/shared/utils/resolveMediaUrl';

export function resolveAdminChatAvatar(imageurl, name = '') {
  const raw = String(imageurl || '').trim();
  if (!raw) {
    const letter = String(name || 'E').trim().charAt(0).toUpperCase() || 'E';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(letter)}&background=1e293b&color=e2e8f0&bold=true`;
  }
  return resolveMediaUrl(raw) || raw;
}

export function formatChatTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
