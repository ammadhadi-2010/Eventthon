/** Minimal user object from localStorage while API profile loads. */
export function readStoredUserStub() {
  const email = String(localStorage.getItem('userEmail') || '').trim();
  const mobile = String(localStorage.getItem('userMobile') || '').trim();
  if (!email && !mobile) return null;

  const role = String(localStorage.getItem('userRole') || 'candidate').trim() || 'candidate';
  const display = String(localStorage.getItem('userName') || '').trim();
  const imageurl = String(localStorage.getItem('userImageurl') || '').trim();

  return {
    email: email || undefined,
    mobile: mobile || undefined,
    role,
    first_name: display || 'User',
    last_name: '',
    imageurl: imageurl || undefined,
    profile_image_url: imageurl || undefined,
    avatar: imageurl || undefined,
    _fromStorage: true,
  };
}

export function persistUserSession(user) {
  if (!user || typeof user !== 'object') return;

  const first = String(user.first_name || '').trim();
  const last = String(user.last_name || '').trim();
  const fullName = `${first} ${last}`.trim();
  if (fullName) localStorage.setItem('userName', fullName);

  const imageurl = String(
    user.imageurl ||
      user.profile_image_url ||
      user.avatar ||
      user.profile_image ||
      '',
  ).trim();
  if (imageurl) localStorage.setItem('userImageurl', imageurl);

  const mongoUserId = String(user._id || user.user_id || '').trim();
  if (mongoUserId) localStorage.setItem('userId', mongoUserId);
}

export function hasStoredSession() {
  return Boolean(
    localStorage.getItem('userId') ||
      localStorage.getItem('userEmail') ||
      localStorage.getItem('userMobile') ||
      localStorage.getItem('user_id'),
  );
}

/** Drop invalid/stale login keys without kicking guests off public pages. */
export function clearStaleSession() {
  [
    'userId',
    'user_id',
    'userEmail',
    'userMobile',
    'userName',
    'userRole',
    'userImageurl',
  ].forEach((key) => localStorage.removeItem(key));
}
