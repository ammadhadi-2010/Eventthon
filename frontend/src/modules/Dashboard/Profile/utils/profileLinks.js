import { getUserDisplayName } from '../../utils/dashboardMedia';
import { isProfileOwner } from '../viewFullProfile/profileOwner';

/** URL slug for public profile routes (`/public/users/:username`). */
export function resolveProfileUsername(user = {}) {
  const username = String(user.username || user.user_name || '').trim();
  if (username) return username.toLowerCase();

  const email = String(user.email || user.author_email || '').trim();
  if (email.includes('@')) return email.split('@')[0].toLowerCase();

  const display = getUserDisplayName(user).trim();
  if (display) return display.replace(/\s+/g, '-').toLowerCase();

  const authorName = String(user.author_name || user.name || '').trim();
  if (authorName) return authorName.replace(/\s+/g, '-').toLowerCase();

  return '';
}

/** Route to open for a user — own profile vs visitor public profile. */
export function resolveUserProfilePath(subject = {}, sessionUser = null) {
  if (isProfileOwner(subject, sessionUser)) return '/profile';

  const slug = resolveProfileUsername(subject);
  if (slug) return `/public/users/${encodeURIComponent(slug)}`;

  return '/profile';
}

/** Build subject object from a feed/post author payload. */
export function profileSubjectFromPost(post = {}) {
  return {
    _id: post.author_id || post.user_id,
    email: post.author_email,
    author_name: post.author_name,
    name: post.author_name,
    username: post.author_username || post.username,
  };
}
