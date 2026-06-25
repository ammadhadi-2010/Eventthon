/** Pass project proposal context into Messages inbox via sessionStorage. */

const STORAGE_KEY = 'et_pending_project_chat';

export function stashProjectChatIntent(intent) {
  if (typeof window === 'undefined' || !intent) return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...intent, ts: Date.now() }));
  } catch {
    /* ignore quota errors */
  }
}

export function readProjectChatIntent() {
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

export function buildProjectChatIntentFromProject(project, extra = {}) {
  const ownerId = String(project?.owner_user_id || project?.ownerUserId || '').trim();
  return {
    seller_user_id: ownerId,
    chat_type: 'project',
    chat_tag: extra.chat_tag || 'Project Proposal',
    context_id: String(project?.id || project?._id || '').trim(),
    context_title: String(project?.title || project?.name || 'Project conversation').trim(),
    ...extra,
  };
}

export function routeProjectChatFromResponse(res, navigate) {
  const ctx = res?.chat_context;
  if (ctx?.seller_user_id || ctx?.context_id) {
    stashProjectChatIntent(ctx);
    navigate('/messages');
    return true;
  }
  return false;
}
