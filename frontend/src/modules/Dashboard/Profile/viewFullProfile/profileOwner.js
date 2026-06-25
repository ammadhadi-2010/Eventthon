import { readStoredUserStub } from '../../../../utils/storedUser';

export function resolveProfileUserId(user) {
  if (!user) return '';
  return String(user._id || user.id || user.user_id || '').trim();
}

/** True when the viewed profile belongs to the authenticated session user. */
export function isProfileOwner(viewedUser, sessionUser = null) {
  const session = sessionUser || readStoredUserStub();
  if (!viewedUser || !session) return false;

  const viewedId = resolveProfileUserId(viewedUser);
  const sessionId = resolveProfileUserId(session);
  if (viewedId && sessionId && viewedId === sessionId) return true;

  const viewedEmail = String(viewedUser.email || '').trim().toLowerCase();
  const sessionEmail = String(session.email || '').trim().toLowerCase();
  if (viewedEmail && sessionEmail && viewedEmail === sessionEmail) return true;

  const viewedMobile = String(viewedUser.mobile || '').trim();
  const sessionMobile = String(session.mobile || localStorage.getItem('userMobile') || '').trim();
  if (viewedMobile && sessionMobile && viewedMobile === sessionMobile) return true;

  return false;
}
