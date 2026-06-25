/** Pass gig inquiry/order context into Messages inbox via sessionStorage. */

const STORAGE_KEY = 'et_pending_gig_chat';

export function stashGigChatIntent(intent) {
  if (typeof window === 'undefined' || !intent) return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...intent, ts: Date.now() }));
  } catch {
    /* ignore quota errors */
  }
}

export function readGigChatIntent() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    sessionStorage.removeItem(STORAGE_KEY);
    return parsed;
  } catch {
    return null;
  }
}

export function buildGigChatIntentFromGig(gig, extra = {}) {
  return {
    seller_user_id: String(gig?.sellerUserId || gig?.seller_user_id || '').trim(),
    chat_type: 'gig',
    chat_tag: extra.chat_tag || 'Gig Inquiry',
    context_id: String(gig?.id || gig?._id || '').trim(),
    context_title: String(gig?.title || 'Gig conversation').trim(),
    package_tier: extra.package_tier || '',
    ...extra,
  };
}
