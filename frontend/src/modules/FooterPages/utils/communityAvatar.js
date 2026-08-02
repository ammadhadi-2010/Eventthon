import { resolveMediaUrl } from '../../../components/shared/utils/resolveMediaUrl';

/** Build a displayable avatar URL from CMS string, member fields, or initials seed. */
export function resolveCommunityAvatar(entry, seedFallback = 'member') {
  if (entry && typeof entry === 'object') {
    const raw = entry.src || entry.avatar || entry.url || '';
    if (raw) return resolveMediaUrl(String(raw));
    const seed = entry.name || entry.initial || seedFallback;
    return `https://api.dicebear.com/8.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
  }
  const s = String(entry || '').trim();
  if (!s) {
    return `https://api.dicebear.com/8.x/avataaars/svg?seed=${encodeURIComponent(seedFallback)}`;
  }
  if (s.startsWith('http') || s.startsWith('/') || s.startsWith('data:')) {
    return resolveMediaUrl(s);
  }
  // Letter / short token → stable generated portrait
  return `https://api.dicebear.com/8.x/avataaars/svg?seed=${encodeURIComponent(s.length <= 2 ? `${seedFallback}-${s}` : s)}`;
}

export function readViewerAvatar() {
  const raw = String(localStorage.getItem('userImageurl') || '').trim();
  const name = String(localStorage.getItem('userName') || 'You').trim() || 'You';
  if (raw) return resolveMediaUrl(raw);
  return `https://api.dicebear.com/8.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
}
