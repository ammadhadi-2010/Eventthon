import { getRankMeta } from '../../../Admin/pages/UserManagement/userManagementData';

function isSameAuthor(post, currentUser) {
  if (!post || !currentUser) return false;
  if (String(post.user_id || '') === String(currentUser._id || '')) return true;
  const author = String(post.author_name || '').trim().toLowerCase();
  const self = `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim().toLowerCase();
  return Boolean(author && self && author === self);
}

function normalizeRankKey(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return '';
  if (!Number.isNaN(Number(raw))) return '';
  return raw;
}

export function resolveAuthorRankKey(post = {}, userData = null) {
  const stored = normalizeRankKey(
    post.author_rank || post.author_rank_key || post.rank_tier || post.rank,
  );
  if (stored) return stored;
  if (isSameAuthor(post, userData)) {
    return normalizeRankKey(userData?.rank) || 'frontline';
  }
  return 'frontline';
}

export function resolveAuthorRankMeta(post = {}, userData = null) {
  return getRankMeta(resolveAuthorRankKey(post, userData));
}

/** @deprecated Network rank number — prefer resolveAuthorRankMeta for feed labels */
export function resolveAuthorNetworkRank(post = {}) {
  const directRank = post.author_rank_number
    ?? post.network_rank
    ?? post.author_rank
    ?? post.rank_number;

  const parsedRank = Number(directRank);
  if (Number.isFinite(parsedRank) && parsedRank > 0) {
    return Math.round(parsedRank);
  }

  const seedSource = String(post.author_id || post._id || post.author_name || '');
  let hashValue = 0;

  for (let index = 0; index < seedSource.length; index += 1) {
    hashValue = (hashValue + seedSource.charCodeAt(index) * (index + 3)) % 997;
  }

  return (hashValue % 499) + 1;
}
