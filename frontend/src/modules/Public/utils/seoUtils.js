export function stripHtml(text) {
  return String(text || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function metaDescriptionFromBio(bio, maxLen = 150) {
  const clean = stripHtml(bio);
  if (!clean) return 'Discover professionals and teams on EventThon Network.';
  if (clean.length <= maxLen) return clean;
  return `${clean.slice(0, maxLen - 3).trim()}...`;
}

export function buildSeoTitle(displayName, role) {
  const name = (displayName || 'Profile').trim();
  const category = (role || 'Professional').trim();
  return `${name} - ${category} | EventThon Network`;
}
