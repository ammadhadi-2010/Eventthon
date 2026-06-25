const FALLBACK_AVATAR = '/default-avatar.png';

/** Resolve actor/system avatar from API imageurl fields. */
export function resolveAlertAvatarUrl(item) {
  const url = String(item?.imageurl || item?.actor_imageurl || '').trim();
  return url || FALLBACK_AVATAR;
}

export function alertAvatarInitial(item) {
  const name = item?.actor_name || item?.title || 'A';
  return String(name).charAt(0).toUpperCase();
}
