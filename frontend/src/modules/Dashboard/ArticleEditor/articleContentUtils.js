import { pickPostMediaPath, resolveMediaUrl, stripMediaUrlToStoragePath } from '../../../components/shared/utils/resolveMediaUrl';

/** Rewrite relative image URLs inside article HTML for correct rendering. */
export function resolveArticleHtmlContent(html = '') {
  const source = String(html || '');
  if (!source) return '';

  return source.replace(/<img\b[^>]*>/gi, (tag) => {
    const dataMatch = tag.match(/data-imageurl=(["'])([^"']+)\1/i);
    const srcMatch = tag.match(/\bsrc=(["'])([^"']+)\1/i);
    const raw = (dataMatch && dataMatch[2]) || (srcMatch && srcMatch[2]) || '';
    const resolved = resolveMediaUrl(raw);
    if (!resolved) return '';

    let next = tag;
    if (srcMatch) {
      next = next.replace(srcMatch[0], `src="${resolved}"`);
    } else {
      next = next.replace(/<img/i, `<img src="${resolved}"`);
    }

    const storagePath = stripMediaUrlToStoragePath(raw);
    if (storagePath && !dataMatch) {
      next = next.replace(/<img/i, `<img data-imageurl="${storagePath}"`);
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

export { pickPostMediaPath };
