import { API_BASE_URL } from '../../../../api/axiosConfig';

/** Resolve avatar URL — imageurl is the canonical profile asset key. */
export function resolveProfileAvatar(userData, draftUrl = '') {
  const raw = String(
    draftUrl ||
      userData?.imageurl ||
      userData?.profile_image_url ||
      userData?.avatar ||
      '',
  ).trim();
  if (!raw) return '';
  if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('blob:')) {
    return raw;
  }
  const path = raw.startsWith('/') ? raw : `/${raw}`;
  return `${API_BASE_URL}${path}`;
}

export const MAX_PROFILE_IMAGE_BYTES = 2 * 1024 * 1024;

export function validateProfileImageFile(file) {
  if (!file) return 'No file selected';
  if (!file.type.startsWith('image/')) return 'Please choose an image file';
  if (file.size > MAX_PROFILE_IMAGE_BYTES) return 'Image must be 2MB or smaller';
  return '';
}
