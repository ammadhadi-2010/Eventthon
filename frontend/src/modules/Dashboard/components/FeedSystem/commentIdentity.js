import { resolveMediaUrl as resolveSharedMediaUrl } from '../../../../components/shared/utils/resolveMediaUrl';
import { getAvatarUrl } from '../../Navbar/userMenuUtils';

function resolveMediaUrl(raw) {
  return resolveSharedMediaUrl(raw);
}

/** Profile photo for a comment author (high-res when available). */
export function resolveCommentAvatar(comment = {}, currentUser = null) {
  const fromComment =
    comment.imageurl ||
    comment.imageUrl ||
    comment.author_avatar_url ||
    comment.author_avatar ||
    comment.profile_image_url ||
    comment.avatar_url ||
    comment.avatar;

  const resolved = resolveMediaUrl(fromComment);
  if (resolved) return resolved;

  const isSelf =
    currentUser &&
    (String(comment.userId || comment.user_id || '') === String(currentUser._id || '') ||
      String(comment.author_name || '').toLowerCase() ===
        `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim().toLowerCase());

  if (isSelf) return getAvatarUrl(currentUser);

  const name = comment.author_name || 'Member';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=128`;
}

export function getAuthorAvatarForSubmit(userData) {
  return getAvatarUrl(userData);
}
