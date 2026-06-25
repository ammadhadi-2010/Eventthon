/**
 * Never surface phone numbers, emails, or raw auth identifiers as seller names in the marketplace UI.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

export function looksLikePhoneNumber(value) {
  const s = String(value ?? '').trim();
  if (!s) return false;
  const digitsOnly = s.replace(/\D/g, '');
  if (digitsOnly.length < 10 || digitsOnly.length > 15) return false;
  return /^[\d\s\-+().]+$/.test(s) || /^\+?\d+$/.test(s.replace(/\s/g, ''));
}

export function looksLikeEmail(value) {
  return EMAIL_RE.test(String(value ?? '').trim());
}

export function isMongoObjectId(value) {
  return typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);
}

function stableAnonSuffix(seed) {
  const s = String(seed || 'seller');
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = Math.imul(31, h) + s.charCodeAt(i);
  }
  return Math.abs(h).toString(36).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5).padEnd(4, 'X');
}

/**
 * @returns {{ label: string, avatarInitial: string }}
 */
export function derivePublicSeller(seller_name, seller_user_id) {
  const name = String(seller_name ?? '').trim();
  const rawId = String(seller_user_id ?? '').trim();

  if (name && !looksLikeEmail(name) && !looksLikePhoneNumber(name)) {
    const initial = name.charAt(0);
    const safeInitial = /[a-z\d]/i.test(initial) ? initial.toUpperCase() : 'S';
    return { label: name, avatarInitial: safeInitial };
  }

  if (looksLikeEmail(rawId) || looksLikePhoneNumber(rawId)) {
    const suffix = stableAnonSuffix(rawId || name || 'gig');
    return { label: `Seller · #${suffix}`, avatarInitial: 'S' };
  }

  if (isMongoObjectId(rawId)) {
    return {
      label: `Seller · #${rawId.slice(-6).toUpperCase()}`,
      avatarInitial: 'S',
    };
  }

  if (/^\d+$/.test(rawId)) {
    return {
      label: `Seller · #${stableAnonSuffix(rawId)}`,
      avatarInitial: 'S',
    };
  }

  if (!rawId) {
    return { label: 'Seller', avatarInitial: 'S' };
  }

  return {
    label: `Seller · #${stableAnonSuffix(rawId)}`,
    avatarInitial: 'S',
  };
}
