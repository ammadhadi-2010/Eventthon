import { API_BASE_URL } from '../../../api/axiosConfig';

function resolveMediaSrc(raw = '') {
  const v = String(raw || '').trim();
  if (!v || v.startsWith('http') || v.startsWith('data:') || v.startsWith('blob:')) return v;
  const base = API_BASE_URL.replace(/\/$/, '');
  let path = v.startsWith('/') ? v : `/${v}`;
  if (path.startsWith('/uploads/')) path = `/static${path}`;
  return `${base}${path}`;
}

/** Rewrite relative image URLs inside article HTML for correct rendering. */
export function resolveArticleHtmlContent(html = '') {
  const source = String(html || '');
  if (!source) return '';

  return source.replace(/<img\b[^>]*>/gi, (tag) => {
    const dataMatch = tag.match(/data-imageurl=(["'])([^"']+)\1/i);
    const srcMatch = tag.match(/\bsrc=(["'])([^"']+)\1/i);
    const raw = (dataMatch && dataMatch[2]) || (srcMatch && srcMatch[2]) || '';
    const resolved = resolveMediaSrc(raw);
    if (!resolved) return '';

    let next = tag;
    if (srcMatch) {
      next = next.replace(srcMatch[0], `src="${resolved}"`);
    } else {
      next = next.replace(/<img/i, `<img src="${resolved}"`);
    }
    return next;
  });
}

export function buildArticleShareUrl(articleId = '') {
  const id = String(articleId || '').trim();
  if (!id || typeof window === 'undefined') return '';
  return `${window.location.origin}/article/view/${encodeURIComponent(id)}`;
}

export function truncateArticleTitle(title = '', max = 48) {
  const text = String(title || '').trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}…`;
}
