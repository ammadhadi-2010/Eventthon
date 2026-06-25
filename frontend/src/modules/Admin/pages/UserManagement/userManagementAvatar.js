const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';

export function resolveUserAvatar(row) {
  const raw = String(row?.imageurl || row?.profile_image_url || row?.avatar || '').trim();
  if (raw) {
    if (raw.startsWith('http') || raw.startsWith('data:')) return raw;
    if (raw.startsWith('/')) return `${API_BASE}${raw}`;
    return `${API_BASE}/${raw}`;
  }
  const seed = encodeURIComponent(row?.displayName || row?.avatarSeed || 'User');
  return `https://ui-avatars.com/api/?name=${seed}&background=6366f1&color=fff&size=128`;
}
