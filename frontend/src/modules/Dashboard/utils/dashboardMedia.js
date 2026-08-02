import {
  pickPostMediaPath,
  resolveMediaUrl,
  stripMediaUrlToStoragePath,
} from '../../../components/shared/utils/resolveMediaUrl';

export { pickPostMediaPath, stripMediaUrlToStoragePath };

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

export function appendMediaCacheBust(url, seed) {
  const clean = String(url || '').trim();
  if (!clean || clean.startsWith('blob:') || clean.startsWith('data:')) return clean;
  const cacheKey = String(
    seed ||
      (typeof window !== 'undefined' ? localStorage.getItem('userMediaVersion') : '') ||
      '',
  ).trim();
  if (!cacheKey) return clean;
  const separator = clean.includes('?') ? '&' : '?';
  return `${clean}${separator}v=${encodeURIComponent(cacheKey)}`;
}

export function resolveDashboardMediaUrl(raw, cacheSeed) {
  const v = pickPostMediaPath(raw) || pickImageurl(typeof raw === 'object' ? raw : { imageurl: raw }) || String(raw || '').trim();
  if (!v) return '';
  const resolved = resolveMediaUrl(v);
  return appendMediaCacheBust(resolved, cacheSeed);
}

function isGenericDisplayName(value) {
  const text = String(value || '').trim().toLowerCase();
  return !text || text === 'user' || text === 'eventthon member' || text === 'member';
}

function isAccountHandleName(value, entity) {
  const text = String(value || '').trim().toLowerCase();
  if (!text || !entity) return false;
  const username = String(entity.username || entity.user_name || '').trim().toLowerCase();
  if (username && text === username) return true;
  const email = String(entity.email || entity.author_email || '').trim().toLowerCase();
  if (email.includes('@') && text === email.split('@')[0]) return true;
  const userId = String(entity.user_id || entity.userId || '').trim().toLowerCase();
  return Boolean(userId && text === userId);
}

function pickDisplayNameCandidate(value, entity) {
  const text = String(value || '').trim();
  if (!text || isGenericDisplayName(text) || isAccountHandleName(text, entity)) return '';
  return text;
}

/** Display name from an API/entity payload only — never reads session localStorage. */
export function getEntityDisplayName(entity) {
  if (!entity) return 'Member';

  const candidates = [
    entity.full_name,
    entity.display_name,
    entity.fullName,
    `${entity.first_name || ''} ${entity.last_name || ''}`.trim(),
    entity.author_name,
    entity.name,
    entity.username,
    entity.user_name,
  ];

  for (const candidate of candidates) {
    const picked = pickDisplayNameCandidate(candidate, entity);
    if (picked) return picked;
  }

  const email = String(entity.email || entity.author_email || '').trim();
  if (email.includes('@')) {
    const prefix = email.split('@')[0];
    if (prefix && !isGenericDisplayName(prefix)) return prefix;
  }

  return 'Member';
}

/** Session-aware display name for the logged-in profile UI. */
export function getUserDisplayName(user) {
  const storedName =
    typeof window !== 'undefined' ? String(localStorage.getItem('userName') || '').trim() : '';

  if (!user) return pickDisplayNameCandidate(storedName, null) || 'Member';

  const fromEntity = getEntityDisplayName(user);
  if (fromEntity !== 'Member') return fromEntity;

  const storedPick = pickDisplayNameCandidate(storedName, user);
  if (storedPick) return storedPick;

  return 'Member';
}
