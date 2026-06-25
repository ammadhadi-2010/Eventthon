import { API_BASE_URL } from '../../../api/axiosConfig';

const BIO_FALLBACK = 'Experienced Full Stack Developer';

export function stripHtmlToPlainText(value = '') {
  if (!value || typeof value !== 'string') return '';
  if (!value.includes('<')) return value.trim();
  const doc = typeof DOMParser !== 'undefined' ? new DOMParser().parseFromString(value, 'text/html') : null;
  const text = doc?.body?.textContent || value.replace(/<[^>]*>/g, ' ');
  return text.replace(/\s+/g, ' ').trim();
}

function trimBioSnippet(plain) {
  if (!plain) return '';
  let text = plain.replace(/\s+/g, ' ').trim();
  const cutMarkers = [/\bTop Skills\b/i, /\bAbout you\b/i, /\bLanguages\b/i, /\bExperience\b/i];
  for (const marker of cutMarkers) {
    const match = text.match(marker);
    if (match?.index > 24) {
      text = text.slice(0, match.index).trim();
      break;
    }
  }
  if (text.length > 120) return `${text.slice(0, 117).trim()}…`;
  return text;
}

export function getDisplayBio(user) {
  const headline = stripHtmlToPlainText(user?.headline || user?.title || '');
  if (headline && headline.length < 80 && !headline.includes('ep-live-preview')) {
    return headline;
  }
  const bioPlain = trimBioSnippet(stripHtmlToPlainText(user?.bio || ''));
  if (bioPlain && !bioPlain.includes('ep-live-preview')) return bioPlain;
  return BIO_FALLBACK;
}

export function getDisplayName(user) {
  const candidates = [user?.name, user?.full_name, user?.username];
  for (const raw of candidates) {
    const plain = stripHtmlToPlainText(raw);
    if (plain && !plain.includes('ep-live-preview')) return plain;
  }
  const email = user?.email || localStorage.getItem('userEmail') || '';
  if (email && email.includes('@')) return email.split('@')[0];
  return 'EventThon User';
}

export function getAvatarUrl(user) {
  const seed = encodeURIComponent(getDisplayName(user));
  const fallback = `https://ui-avatars.com/api/?name=${seed}&background=6366f1&color=fff&size=128`;
  const storedImage =
    typeof localStorage !== 'undefined' ? String(localStorage.getItem('userImageurl') || '').trim() : '';
  const raw = String(
    user?.profile_image_url ||
      user?.avatar ||
      user?.profile_image ||
      user?.imageurl ||
      storedImage ||
      '',
  ).trim();
  if (!raw || raw.includes('ep-live-preview')) return fallback;
  if (raw.startsWith('http') || raw.startsWith('blob:') || raw.startsWith('data:')) return raw;
  return `${API_BASE_URL}${raw.startsWith('/') ? raw : `/${raw}`}`;
}
