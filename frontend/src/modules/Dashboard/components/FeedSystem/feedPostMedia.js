import { API_BASE_URL } from '../../../../api/axiosConfig';
import { pickImageurl, resolveDashboardMediaUrl, getUserDisplayName } from '../../utils/dashboardMedia';
import { resolveFeedAuthorFields } from './feedAuthor';

const BRACKET_MEDIA_RE = /\[(?:img|image|media)\][^\n]*/gi;
const VIDEO_PATH_RE = /\.(mp4|webm|mov|avi|mkv|m4v|ogv)(\?|#|$)/i;

export function sanitizeFeedPostText(raw = '') {
  return String(raw)
    .replace(BRACKET_MEDIA_RE, '')
    .replace(/\[img\]/gi, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\u00a0/g, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeFeedLabel(label = '') {
  const text = String(label).trim();
  if (/^artucle$/i.test(text)) return 'Article';
  return text.replace(/artucle/gi, 'Article');
}

export function resolveFeedMediaUrl(raw) {
  const v = String(raw || '').trim();
  if (!v || v.includes('ep-live-preview')) return '';
  if (v.startsWith('http') || v.startsWith('blob:') || v.startsWith('data:')) return v;
  const base = API_BASE_URL.replace(/\/$/, '');
  return `${base}${v.startsWith('/') ? v : `/${v}`}`;
}

export function isVideoMediaPath(raw) {
  const path = String(raw || '').trim().toLowerCase();
  if (!path) return false;
  if (VIDEO_PATH_RE.test(path)) return true;
  return path.includes('/video/') || path.includes('video%2F');
}

export function detectMediaKind(raw) {
  return isVideoMediaPath(raw) ? 'video' : 'image';
}

function collectRawMediaPaths(post) {
  const paths = [];
  const media = post?.media;
  if (Array.isArray(media)) {
    media.forEach((item) => {
      if (typeof item === 'string') paths.push(item);
      else paths.push(item?.url || item?.imageurl || item?.imageUrl || item?.src || '');
    });
  } else if (typeof media === 'string') {
    paths.push(media);
  }
  if (post?.post_type === 'ARTICLE') {
    const cover = post?.cover_image || post?.imageurl || post?.imageUrl || '';
    if (cover) paths.push(cover);
  }
  return paths.filter(Boolean);
}

/** Resolved media items for feed rendering (video vs image). */
export function getPostMediaItems(post) {
  const seen = new Set();
  const items = [];
  collectRawMediaPaths(post).forEach((raw) => {
    const url = resolveFeedMediaUrl(raw);
    if (!url || seen.has(url)) return;
    seen.add(url);
    items.push({ url, kind: detectMediaKind(raw || url) });
  });
  return items;
}

export function getPostMediaUrls(post) {
  return getPostMediaItems(post).map((item) => item.url);
}

function isSameAuthor(post, currentUser) {
  if (!post || !currentUser) return false;
  const postAuthorId = String(post.author_id || post.user_id || '').trim();
  const currentId = String(currentUser._id || currentUser.id || '').trim();
  if (postAuthorId && currentId && postAuthorId === currentId) return true;

  const author = String(post.author_name || '').trim().toLowerCase();
  const selfName = getUserDisplayName(currentUser).trim().toLowerCase();
  if (author && selfName && author === selfName) return true;

  const emailPrefix = String(currentUser.email || '').split('@')[0].toLowerCase();
  return Boolean(emailPrefix && author && author === emailPrefix);
}

/** Author avatar for post header (imageurl standard). */
export function resolvePostAuthorAvatar(post, currentUser) {
  const authorFields = resolveFeedAuthorFields(post);
  const fromPost = pickImageurl({ imageurl: authorFields.author_imageurl });
  if (fromPost) return resolveDashboardMediaUrl(fromPost);
  if (isSameAuthor(post, currentUser)) {
    const selfUrl = pickImageurl(currentUser);
    if (selfUrl) return resolveDashboardMediaUrl(selfUrl);
  }
  return '';
}
