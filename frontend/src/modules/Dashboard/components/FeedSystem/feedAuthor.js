import { getUserDisplayName, pickImageurl } from '../../utils/dashboardMedia';

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

function pickFirstValidName(candidates = []) {
  for (const candidate of candidates) {
    const value = String(candidate || '').trim();
    if (value && !isGenericAuthorName(value)) return value;
  }
  for (const candidate of candidates) {
    const value = String(candidate || '').trim();
    if (value) return value;
  }
  return 'Member';
}

/** Normalize author display fields from timeline/article API payloads. */
export function resolveFeedAuthorFields(source = {}) {
  const author = source.author || source.user || source.created_by || {};

  const authorName = pickFirstValidName([
    source.author_name,
    author.name,
    author.username,
    author.display_name,
    getUserDisplayName(author),
    source.author_email?.includes('@') ? source.author_email.split('@')[0] : '',
    author.email?.includes('@') ? author.email.split('@')[0] : '',
  ]);

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
