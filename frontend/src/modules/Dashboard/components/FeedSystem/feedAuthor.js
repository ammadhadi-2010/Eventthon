import { getEntityDisplayName, getUserDisplayName, pickImageurl } from '../../utils/dashboardMedia';

const GENERIC_AUTHOR_NAMES = new Set([
  '',
  'user',
  'member',
  'eventthon member',
  'article author',
  'developer',
]);

export function isGenericAuthorName(value = '') {
  return GENERIC_AUTHOR_NAMES.has(String(value || '').trim().toLowerCase());
}

function isAccountHandle(value = '', context = {}) {
  const text = String(value || '').trim().toLowerCase();
  if (!text || isGenericAuthorName(text)) return false;

  const username = String(context.username || context.user_name || context.name || '').trim().toLowerCase();
  if (username && text === username) return true;

  const email = String(context.author_email || context.email || '').trim().toLowerCase();
  if (email.includes('@') && text === email.split('@')[0]) return true;

  return false;
}

function pickFirstValidName(candidates = [], context = {}) {
  for (const candidate of candidates) {
    const value = String(candidate || '').trim();
    if (value && !isGenericAuthorName(value) && !isAccountHandle(value, context)) return value;
  }
  for (const candidate of candidates) {
    const value = String(candidate || '').trim();
    if (value && !isGenericAuthorName(value)) return value;
  }
  return 'Member';
}

/** Normalize author display fields from timeline/article API payloads. */
export function resolveFeedAuthorFields(source = {}) {
  const author = source.author || source.user || source.created_by || {};
  const context = {
    ...author,
    author_email: source.author_email || author.email,
    email: author.email || source.author_email,
  };

  const apiAuthorName = String(source.author_name || '').trim();
  const authorName = apiAuthorName && !isGenericAuthorName(apiAuthorName)
    ? apiAuthorName
    : pickFirstValidName([
      `${source.first_name || author.first_name || ''} ${source.last_name || author.last_name || ''}`.trim(),
      source.full_name,
      author.full_name,
      source.display_name,
      author.display_name,
      author.name,
      source.name,
      author.username,
      source.username,
      getEntityDisplayName(author),
      getEntityDisplayName(source),
      apiAuthorName,
    ], context);

  const authorImageurl = pickImageurl({
    imageurl:
      source.author_imageurl ||
      source.authorImageurl ||
      source.author_avatar_url ||
      source.author_avatar ||
      author.imageurl ||
      author.profile_image_url ||
      author.avatar,
  });

  const authorRank =
    String(source.author_rank || author.rank || author.rank_tier || '').trim().toLowerCase() ||
    'frontline';

  const authorId = String(
    source.author_id || source.user_id || author._id || author.id || '',
  ).trim();

  return {
    author_name: authorName,
    author_imageurl: authorImageurl,
    author_rank: authorRank,
    author_id: authorId,
  };
}

export function isPostByCurrentUser(post = {}, currentUser = null) {
  if (!post || !currentUser) return false;
  const postAuthorId = String(post.author_id || post.user_id || '').trim();
  const currentId = String(
    currentUser._id || currentUser.id || currentUser.user_id || '',
  ).trim();
  return Boolean(postAuthorId && currentId && postAuthorId === currentId);
}

export function resolvePostDisplayAuthorName(post = {}, userData = null) {
  const fields = resolveFeedAuthorFields(post);
  if (!userData || !isPostByCurrentUser(post, userData)) {
    return fields.author_name;
  }

  const liveName = getUserDisplayName(userData);
  return liveName && liveName !== 'Member' ? liveName : fields.author_name;
}

export function truncateFeedText(text = '', maxChars = 340) {
  const cleaned = String(text || '').trim();
  if (!cleaned || cleaned.length <= maxChars) {
    return { preview: cleaned, truncated: false };
  }

  let cut = cleaned.slice(0, maxChars);
  const lastSpace = cut.lastIndexOf(' ');
  if (lastSpace > maxChars * 0.55) cut = cut.slice(0, lastSpace);
  const preview = cut.replace(/[.,;:\s-–—]+$/, '').trim();

  return {
    preview: preview || cleaned.slice(0, maxChars).trim(),
    truncated: true,
  };
}
