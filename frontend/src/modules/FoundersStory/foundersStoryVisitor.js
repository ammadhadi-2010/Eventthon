const STORAGE_KEY = 'et_founders_story_visitor';

export function getFoundersStoryVisitorId() {
  try {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      const rand = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      id = `v_${rand}`;
      localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    return `v_guest_${Date.now()}`;
  }
}

export function resolveCommentAuthorName(userData) {
  const fromUser = userData?.name || userData?.full_name || userData?.username;
  if (fromUser && String(fromUser).trim()) return String(fromUser).trim();
  try {
    const raw = localStorage.getItem('userData');
    if (raw) {
      const parsed = JSON.parse(raw);
      const name = parsed?.name || parsed?.full_name || parsed?.username;
      if (name && String(name).trim()) return String(name).trim();
    }
  } catch {
    /* ignore */
  }
  return '';
}
