import { getUserDisplayName } from '../../utils/dashboardMedia';

const GENERIC_STATUSES = new Set(['', 'published', 'live', 'active']);

export const PROFILE_POST_TABS = [
  { id: 'all', label: 'All' },
  { id: 'published', label: 'Published' },
  { id: 'draft', label: 'Draft' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'pinned', label: 'Pinned' },
  { id: 'articles', label: 'Articles' },
];

function stripHtml(value = '') {
  return String(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function resolveStatus(item = {}) {
  const status = String(item.status || '').trim().toLowerCase();
  if (status === 'draft') return 'draft';
  if (status === 'scheduled') return 'scheduled';
  const scheduledAt = item.scheduled_at || item.scheduledAt;
  if (scheduledAt) {
    const when = new Date(scheduledAt);
    if (!Number.isNaN(when.getTime()) && when.getTime() > Date.now()) return 'scheduled';
  }
  if (GENERIC_STATUSES.has(status) || !status) return 'published';
  return status;
}

function resolveImageurl(item = {}) {
  const media = Array.isArray(item.media) ? item.media : [];
  const firstMedia = typeof media[0] === 'string' ? media[0] : media[0]?.url || media[0]?.imageurl;
  return String(item.imageurl || item.cover_image || item.imageUrl || firstMedia || '').trim();
}

function resolveMetrics(item = {}) {
  const meta = item.metadata || {};
  return {
    views: Number(item.views_count ?? item.views ?? meta.views ?? 0),
    likes: Number(item.likes_count ?? meta.likes ?? 0),
    comments: Number(item.comments_count ?? meta.comments ?? 0),
    shares: Number(item.reposts_count ?? item.send_count ?? meta.shares ?? meta.sends ?? 0),
  };
}

export function belongsToCurrentUser(item = {}, userData = null) {
  const uid = String(
    userData?._id || userData?.id || localStorage.getItem('userId') || localStorage.getItem('user_id') || '',
  ).trim();
  const email = String(userData?.email || localStorage.getItem('userEmail') || '').trim().toLowerCase();
  const authorId = String(item.author_id || item.user_id || '').trim();
  const authorEmail = String(item.author_email || '').trim().toLowerCase();
  const displayName = getUserDisplayName(userData).trim().toLowerCase();
  const authorName = String(item.author_name || '').trim().toLowerCase();

  if (uid && authorId && uid === authorId) return true;
  if (email && authorEmail && email === authorEmail) return true;
  if (displayName && authorName && displayName === authorName) return true;
  if (email && authorName && email.split('@')[0] === authorName) return true;
  return false;
}

export function normalizeProfilePost(item = {}, kind = 'post') {
  const isArticle = kind === 'article';
  const body = stripHtml(item.content || item.excerpt || item.message || '');
  const title = isArticle
    ? String(item.title || 'Untitled Article').trim()
    : String(item.article_title || item.title || body.slice(0, 72) || 'Untitled Post').trim();

  return {
    id: String(item._id || item.id || ''),
    kind: isArticle ? 'article' : 'post',
    title,
    excerpt: isArticle ? stripHtml(item.excerpt || item.content || '') : body,
    imageurl: resolveImageurl(item),
    status: resolveStatus(item),
    pinned: Boolean(item.pinned || item.is_pinned),
    createdAt: item.created_at || item.updated_at || null,
    metrics: resolveMetrics(item),
    postType: String(item.post_type || (isArticle ? 'ARTICLE' : 'POST')).toUpperCase(),
    raw: item,
  };
}

export function mergeProfilePosts(posts = [], articles = [], userData = null) {
  const ownedPosts = posts
    .filter((row) => belongsToCurrentUser(row, userData))
    .map((row) => normalizeProfilePost(row, 'post'));

  const ownedArticles = articles
    .filter((row) => belongsToCurrentUser(row, userData))
    .map((row) => normalizeProfilePost(row, 'article'));

  return [...ownedPosts, ...ownedArticles].sort((a, b) => {
    const aTime = new Date(a.createdAt || 0).getTime();
    const bTime = new Date(b.createdAt || 0).getTime();
    return bTime - aTime;
  });
}

export function filterProfilePosts(items = [], { tab = 'all', query = '' } = {}) {
  const term = String(query || '').trim().toLowerCase();
  let rows = [...items];

  if (tab === 'published') rows = rows.filter((row) => row.status === 'published');
  if (tab === 'draft') rows = rows.filter((row) => row.status === 'draft');
  if (tab === 'scheduled') rows = rows.filter((row) => row.status === 'scheduled');
  if (tab === 'pinned') rows = rows.filter((row) => row.pinned);
  if (tab === 'articles') rows = rows.filter((row) => row.kind === 'article');

  if (term) {
    rows = rows.filter((row) =>
      [row.title, row.excerpt, row.postType]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
  }

  return rows.sort((a, b) => Number(b.pinned) - Number(a.pinned));
}

export function formatMetricCount(value = 0) {
  const num = Number(value) || 0;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(num);
}

export function formatTimeAgo(isoText) {
  if (!isoText) return 'Recently';
  const date = new Date(isoText);
  if (Number.isNaN(date.getTime())) return 'Recently';

  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

export function statusLabel(status = 'published') {
  const key = String(status || 'published').toLowerCase();
  if (key === 'draft') return 'Draft';
  if (key === 'scheduled') return 'Scheduled';
  return 'Published';
}
