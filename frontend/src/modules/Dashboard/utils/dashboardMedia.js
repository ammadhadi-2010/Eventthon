import { API_BASE_URL } from '../../../api/axiosConfig';

/** Standard profile / preview image from API payload (imageurl first). */
export function pickImageurl(entity) {
  if (!entity) return '';
  const url = String(
    entity.imageurl ||
      entity.imageUrl ||
      entity.image_url ||
      entity.profile_image_url ||
      entity.profileImage ||
      entity.avatar ||
      entity.banner ||
      entity.cover_preview ||
      '',
  ).trim();
  return url;
}

export function resolveDashboardMediaUrl(raw) {
  const v = pickImageurl({ imageurl: raw }) || String(raw || '').trim();
  if (!v || v.includes('ep-live-preview')) return '';
  if (v.startsWith('http') || v.startsWith('blob:') || v.startsWith('data:')) return v;
  return `${API_BASE_URL}${v.startsWith('/') ? v : `/${v}`}`;
}

export function getUserDisplayName(user) {
  const first = `${user?.first_name || ''} ${user?.last_name || ''}`.trim();
  if (first) return first;
  if (user?.name) return String(user.name);
  const email = user?.email || '';
  if (email.includes('@')) return email.split('@')[0];
  return 'Member';
}
