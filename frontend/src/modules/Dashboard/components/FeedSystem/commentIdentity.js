import { API_BASE_URL } from '../../../../api/axiosConfig';
import { getAvatarUrl } from '../../Navbar/userMenuUtils';

function resolveMediaUrl(raw) {
  const v = String(raw || '').trim();
  if (!v || v.includes('ep-live-preview')) return '';
  if (v.startsWith('http') || v.startsWith('blob:') || v.startsWith('data:')) return v;
  return `${API_BASE_URL}${v.startsWith('/') ? v : `/${v}`}`;
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
