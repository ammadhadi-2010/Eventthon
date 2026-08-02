import { resolveMediaUrl } from '../../../../components/shared/utils/resolveMediaUrl';
import { pickImageurl, resolveDashboardMediaUrl } from '../../utils/dashboardMedia';

const FALLBACK_AVATAR = '/default-avatar.png';

/** Resolve actor/system avatar from API imageurl fields (API-origin aware). */
export function resolveAlertAvatarUrl(item) {
  const raw = pickImageurl(item) || String(item?.actor_imageurl || '').trim();
  if (!raw) return FALLBACK_AVATAR;
  const resolved = resolveDashboardMediaUrl(raw) || resolveMediaUrl(raw);
  return resolved || FALLBACK_AVATAR;
}

export function alertAvatarInitial(item) {
  const name = item?.actor_name || item?.title || 'A';
  return String(name).charAt(0).toUpperCase();
}

export function hasAlertAvatarImage(item) {
  const url = resolveAlertAvatarUrl(item);
  return Boolean(url && url !== FALLBACK_AVATAR);
}
