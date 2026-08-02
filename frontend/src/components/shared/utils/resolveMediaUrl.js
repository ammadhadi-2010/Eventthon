/**
 * Client media URL resolver — keep in sync with backend media_urls.py + static_media_routes.py
 *
 * Rules:
 * - /static/uploads/*  → always API server (backend redirects to CDN if file missing locally)
 * - /assets/*          → frontend public/ origin in the browser
 * - Other /static/*    → API server
 * - Legacy full URLs   → normalize to path, then apply rules above
 */
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

const LEGACY_MEDIA_HOSTS =
  /^(167\.172\.158\.47|eventthone\.com|www\.eventthone\.com|localhost|127\.0\.0\.1)$/i;

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

function isLocalhostHost(hostname = '') {
  return /^(localhost|127\.0\.0\.1)$/i.test(String(hostname || '').trim());
}

/** Rewrite API URLs pointing at localhost when app runs on production domain. */
export function rewriteLocalhostMediaUrl(url = '') {
  const value = String(url || '').trim();
  if (!value.startsWith('http://') && !value.startsWith('https://')) return value;
  try {
    const parsed = new URL(value);
    if (!isLocalhostHost(parsed.hostname)) return value;
    if (typeof window === 'undefined') return value;
    const origin = String(window.location.origin || '').replace(/\/+$/, '');
    if (!origin || isLocalhostHost(window.location.hostname)) return value;
    return `${origin}${parsed.pathname}${parsed.search}`;
  } catch {
    return value;
  }
}

function resolveMediaBaseUrl() {
  const configured = String(API_BASE_URL || '').replace(/\/+$/, '');
  if (typeof window === 'undefined') return configured || 'http://127.0.0.1:8000';

  const origin = String(window.location.origin || '').replace(/\/+$/, '');
  if (!configured) return origin;

  if (
    process.env.NODE_ENV === 'production' &&
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(configured)
  ) {
    return origin;
  }

  return configured;
}

function isManagedStaticPath(path = '') {
  const normalized = normalizeMediaStoragePath(path);
  return (
    normalized.startsWith('/static/') ||
    normalized.startsWith('/uploads/') ||
    normalized.startsWith('/assets/')
  );
}

function resolveStaticMediaBaseUrl(forPath = '') {
  const normalized = normalizeMediaStoragePath(forPath);

  if (normalized.startsWith('/assets/')) {
    if (typeof window !== 'undefined' && window.location?.origin) {
      return String(window.location.origin).replace(/\/+$/, '');
    }
    return resolveMediaBaseUrl();
  }

  if (isManagedStaticPath(normalized)) {
    return resolveMediaBaseUrl();
  }

  return resolveMediaBaseUrl();
}

function rebaseStaticMediaUrl(raw = '') {
  const value = String(raw || '').trim();
  if (!value) return '';

  let path = value;
  if (value.startsWith('http://') || value.startsWith('https://')) {
    try {
      const parsed = new URL(value);
      path = `${parsed.pathname}${parsed.search || ''}`;
    } catch {
      return rewriteLocalhostMediaUrl(value);
    }
  }

  if (!isManagedStaticPath(path)) {
    return value.startsWith('http://') || value.startsWith('https://')
      ? rewriteLocalhostMediaUrl(value)
      : value;
  }

  const base = resolveStaticMediaBaseUrl(path);
  const normalized = normalizeMediaStoragePath(path);
  return rewriteLocalhostMediaUrl(`${base}${normalized}`);
}

/** Prefix relative API paths with API base; pass through absolute URLs. */
export function resolveMediaUrl(raw) {
  const picked = typeof raw === 'object' ? pickPostMediaPath(raw) : String(raw || '').trim();
  const value = picked || String(raw || '').trim();
  if (!value || value.includes('ep-live-preview')) return '';
  if (value.startsWith('blob:') || value.startsWith('data:')) return value;

  if (value.startsWith('http://') || value.startsWith('https://')) {
    try {
      const host = new URL(value).hostname;
      if (LEGACY_MEDIA_HOSTS.test(host) || isManagedStaticPath(value)) {
        return rebaseStaticMediaUrl(value);
      }
    } catch {
      /* fall through */
    }
    return rewriteLocalhostMediaUrl(value);
  }

  const path = normalizeMediaStoragePath(value);
  const base = resolveStaticMediaBaseUrl(path);
  return rewriteLocalhostMediaUrl(base ? `${base}${path}` : path);
}

/** Keep API/storage paths relative when persisting edits. */
export function stripMediaUrlToStoragePath(raw) {
  return normalizeMediaStoragePath(raw);
}
