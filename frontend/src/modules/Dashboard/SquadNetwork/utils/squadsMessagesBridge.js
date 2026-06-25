/** Pass squad invitation context into Messages inbox via sessionStorage. */

const STORAGE_KEY = 'et_pending_squad_chat';

export function stashSquadChatIntent(intent) {
  if (typeof window === 'undefined' || !intent) return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...intent, ts: Date.now() }));
  } catch {
    /* ignore quota errors */
  }
}

export function readSquadChatIntent() {
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

export function routeSquadChatFromResponse(res, navigate) {
  const ctx = res?.chat_context;
  if (ctx?.seller_user_id || ctx?.context_id) {
    stashSquadChatIntent(ctx);
    navigate('/messages');
    return true;
  }
  return false;
}
