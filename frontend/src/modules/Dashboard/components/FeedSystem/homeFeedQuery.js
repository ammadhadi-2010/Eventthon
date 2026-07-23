import API from '../../../../api/axiosConfig';
import { pickPostMediaPath } from '../../../../components/shared/utils/resolveMediaUrl';
import { resolveFeedAuthorFields } from './feedAuthor';

const FEED_TIMEOUT_MS = 20000;

const stripHtml = (value = '') =>
  String(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

function safeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

export function resolveTimelinePostId(post = {}) {
  const raw = post?._id ?? post?.id ?? post?.post_id ?? '';
  if (raw && typeof raw === 'object') {
    return String(raw.$oid || raw.oid || '').trim();
  }
  return String(raw || '').trim();
}

/** Timeline rows always include carousel and non-carousel posts alike. */
export function normalizeTimelinePost(post = {}) {
  if (!post || typeof post !== 'object') return null;

  const postId = resolveTimelinePostId(post);
  if (!postId) return null;

  const postType = String(post.post_type || 'POST').toUpperCase();
  const media = safeArray(post.media);
  const coverImage = pickPostMediaPath(post);
  const authorFields = resolveFeedAuthorFields(post);

  return {
    ...post,
    _id: postId,
    id: postId,
    post_type: postType,
    content: String(post.content || post.message || '').trim(),
    author_name: authorFields.author_name,
    author_title: String(post.author_title || post.designation || '').trim(),
    author_rank: authorFields.author_rank,
    author_id: authorFields.author_id || post.author_id || post.user_id || '',
    author_imageurl: authorFields.author_imageurl,
    imageurl: coverImage,
    media: media.length ? media : coverImage ? [coverImage] : [],
    likes_count: Number(post.likes_count || 0),
    comments_count: Number(post.comments_count || 0),
    reposts_count: Number(post.reposts_count || 0),
    send_count: Number(post.send_count || 0),
    views_count: Number(post.views_count || post.views || 0),
    progress_percent: post.progress_percent ?? null,
    achievement_metric: post.achievement_metric || '',
    is_carousel_update: Boolean(post.is_carousel_update),
    created_at: post.created_at || null,
  };
}

function mapArticleToFeedItem(article = {}) {
  const cover = pickPostMediaPath(article);
  const authorFields = resolveFeedAuthorFields(article);
  const fullContent = stripHtml(article.content || '');
  const previewContent = stripHtml(article.excerpt || article.content || '');

  return normalizeTimelinePost({
    ...article,
    _id: article._id || article.id,
    post_type: 'ARTICLE',
    content: previewContent,
    full_content: fullContent,
    author_name: authorFields.author_name,
    author_title: String(article.author_title || '').trim(),
    author_rank: authorFields.author_rank,
    author_id: authorFields.author_id || article.author_id || '',
    author_imageurl: authorFields.author_imageurl,
    imageurl: cover,
    media: cover ? [cover] : [],
    article_title: article.title || '',
    article_slug: article.slug || '',
    likes_count: article.metadata?.likes || 0,
    comments_count: article.comments_count || article.metadata?.comments || 0,
    reposts_count: article.metadata?.shares || 0,
    send_count: article.send_count || article.metadata?.sends || 0,
    views_count: article.metadata?.views || 0,
    tags: safeArray(article.tags),
    created_at: article.created_at,
  });
}

function parsePostsResponse(payload) {
  const rows = payload?.status === 'success'
    ? safeArray(payload.data)
    : safeArray(payload?.data);
  return rows.map(normalizeTimelinePost).filter(Boolean);
}

function parseArticlesResponse(payload) {
  const rows = Array.isArray(payload) ? payload : safeArray(payload?.data);
  return rows
    .filter((item) => String(item?.status || 'published').toLowerCase() === 'published')
    .map(mapArticleToFeedItem)
    .filter(Boolean);
}

export async function fetchHomeTimelineFeed() {
  let postItems = [];
  let articleItems = [];

  try {
    const postsRes = await API.get('/api/posts/all', { timeout: FEED_TIMEOUT_MS });
    postItems = parsePostsResponse(postsRes?.data);
    console.info('Home timeline posts loaded:', postItems.length);
  } catch (err) {
    console.error('Home feed posts request failed:', err?.message || err);
  }

  try {
    const articlesRes = await API.get('/api/articles/articles/all', { timeout: FEED_TIMEOUT_MS });
    articleItems = parseArticlesResponse(articlesRes?.data);
    console.info('Home timeline articles loaded:', articleItems.length);
  } catch (err) {
    console.error('Home feed articles request failed:', err?.message || err);
  }

  const mergedFeed = [...postItems, ...articleItems].sort((a, b) => {
    const aTime = new Date(a?.created_at || 0).getTime();
    const bTime = new Date(b?.created_at || 0).getTime();
    return bTime - aTime;
  });

  return mergedFeed;
}
