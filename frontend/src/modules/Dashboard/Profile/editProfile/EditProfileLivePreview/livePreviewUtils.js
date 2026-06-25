import { API_BASE_URL } from '../../../../../api/axiosConfig';

export const DEFAULT_ABOUT =
  'Experienced Full Stack Developer specializing in modern JavaScript frameworks and scalable backend systems. Passionate about clean code, performance, and delivering products users love.';

/** Plain bio for preview fallback. */
export function stripBioToPlain(html) {
  if (!html || typeof html !== 'string') return '';
  const d = document.createElement('div');
  d.innerHTML = html;
  return String(d.innerText || d.textContent || '').trim();
}

export function bioLooksLikeHtml(s) {
  return typeof s === 'string' && /<[a-z][\s/>]/i.test(s.trim());
}

export function educationYears(e) {
  const ys = [e?.startYear, e?.endYear].map((y) => String(y ?? '').trim()).filter(Boolean);
  if (ys.length === 2) return `${ys[0]} — ${ys[1]}`;
  return ys[0] || '';
}

export function resolvePreviewMedia(val) {
  if (!val || typeof val !== 'string') return '';
  const v = val.trim();
  if (!v) return '';
  if (v.startsWith('http://') || v.startsWith('https://') || v.startsWith('blob:')) return v;
  const path = v.startsWith('/') ? v : `/${v}`;
  return `${API_BASE_URL}${path}`;
}
