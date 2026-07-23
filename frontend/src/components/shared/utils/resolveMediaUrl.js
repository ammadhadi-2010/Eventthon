import { API_BASE_URL } from '../../../api/axiosConfig';

const POST_MEDIA_KEYS = [
  'imageurl',
  'imageUrl',
  'image_url',
  'media_url',
  'cover_image',
  'cover_imageurl',
  'coverImage',
  'coverImageUrl',
  'cover_preview',
  'thumbnail_url',
  'url',
  'src',
];

/** Extract stored media path from API payloads (posts, articles, feed cards). */
export function pickPostMediaPath(entity) {
  if (!entity) return '';
  if (typeof entity === 'string') return String(entity).trim();

  for (const key of POST_MEDIA_KEYS) {
    const value = String(entity[key] || '').trim();
    if (value) return value;
  }

  const media = entity.media;
  if (Array.isArray(media) && media.length) {
    const first = media[0];
    if (typeof first === 'string') return first.trim();
    return pickPostMediaPath(first);
  }

  return '';
}

/** Normalize stored paths to /static/... form. */
export function normalizeMediaStoragePath(raw = '') {
  let path = String(raw || '').trim();
  if (!path) return '';

  if (path.startsWith('http://') || path.startsWith('https://')) {
    try {
      path = new URL(path).pathname + (new URL(path).search || '');
    } catch {
      return path;
    }
  }

  if (path.startsWith('/uploads/')) path = `/static${path}`;
  return path.startsWith('/') ? path : `/${path}`;
}

function resolveMediaBaseUrl() {
  const configured = String(API_BASE_URL || '').replace(/\/+$/, '');
  if (typeof window === 'undefined') return configured || 'http://127.0.0.1:8000';

  const origin = String(window.location.origin || '').replace(/\/+$/, '');
  if (!configured) return origin;

  // Production builds without REACT_APP_API_BASE_URL default to localhost — use same origin instead.
  if (
    process.env.NODE_ENV === 'production' &&
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(configured)
  ) {
    return origin;
  }

  return configured;
}

/** Prefix relative API paths with API base; pass through absolute URLs. */
export function resolveMediaUrl(raw) {
  const picked = typeof raw === 'object' ? pickPostMediaPath(raw) : String(raw || '').trim();
  const value = picked || String(raw || '').trim();
  if (!value || value.includes('ep-live-preview')) return '';
  if (value.startsWith('blob:') || value.startsWith('data:')) return value;
  if (value.startsWith('http://') || value.startsWith('https://')) return value;

  const path = normalizeMediaStoragePath(value);
  const base = resolveMediaBaseUrl();
  return base ? `${base}${path}` : path;
}

/** Keep API/storage paths relative when persisting edits. */
export function stripMediaUrlToStoragePath(raw) {
  return normalizeMediaStoragePath(raw);
}
