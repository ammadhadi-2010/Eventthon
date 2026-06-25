import { API_BASE_URL } from '../../../../api/axiosConfig';

function parseWorkingStickers(raw) {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string' && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function normalizeReply(reply, idx) {
  return {
    ...reply,
    id: reply?.id || reply?._id || `r-${idx}-${reply?.created_at || Date.now()}`,
    author_avatar_url:
      reply?.author_avatar_url ||
      reply?.author_avatar ||
      reply?.profile_image_url ||
      reply?.avatar_url ||
      null,
  };
}

export const normalizeComments = (items = []) =>
  items.map((comment, idx) => ({
    ...comment,
    id: comment.id || comment._id || `${idx}-${comment.created_at || Date.now()}`,
    likes_count: comment.likes_count || 0,
    likedByMe: false,
    image_url: comment.image_url || null,
    author_avatar_url:
      comment.author_avatar_url ||
      comment.author_avatar ||
      comment.profile_image_url ||
      comment.avatar_url ||
      null,
    working_stickers: parseWorkingStickers(comment.working_stickers),
    replies: Array.isArray(comment.replies) ? comment.replies.map(normalizeReply) : comment.replies,
  }));

export function getCommentsListRoute(entityType, postId) {
  if (entityType === 'article') {
    return `${API_BASE_URL}/api/articles/articles/${postId}/comments`;
  }
  return `${API_BASE_URL}/api/posts/${postId}/comments`;
}

export function getCommentApiRoute(entityType, postId, kind, id = '') {
  if (entityType === 'article') {
    if (kind === 'comment') return `${API_BASE_URL}/api/articles/articles/${postId}/comment`;
    if (kind === 'reply') return `${API_BASE_URL}/api/articles/articles/comment/${id}/reply`;
    if (kind === 'like') return `${API_BASE_URL}/api/articles/articles/comment/${id}/like`;
  }
  if (kind === 'comment') return `${API_BASE_URL}/api/posts/${postId}/comment`;
  if (kind === 'reply') return `${API_BASE_URL}/api/posts/comment/${id}/reply`;
  if (kind === 'like') return `${API_BASE_URL}/api/posts/comment/${id}/like`;
  return '';
}

export const buildReplyKey = (commentId, parentReplyId = 'root') =>
  `${commentId}::${parentReplyId}`;
