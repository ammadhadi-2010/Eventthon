/** Session headers required by profile API ownership checks. */

export function getProfileSessionHeaders() {
  const headers = {};
  const email = localStorage.getItem('userEmail');
  const mobile = localStorage.getItem('userMobile');
  if (email) headers['X-User-Email'] = email;
  if (mobile) headers['X-User-Mobile'] = mobile;
  return headers;
}

export function getProfileIdentifier(userData) {
  return String(
    userData?.email ||
      userData?.mobile ||
      localStorage.getItem('userEmail') ||
      localStorage.getItem('userMobile') ||
      '',
  ).trim();
}

export function assertProfileIdentifier(identifier) {
  const id = String(identifier || '').trim();
  if (!id) {
    throw new Error('User identifier missing');
  }
  const email = (localStorage.getItem('userEmail') || '').trim().toLowerCase();
  const mobile = (localStorage.getItem('userMobile') || '').trim();
  if (!email && !mobile) {
    throw new Error('You must be logged in to update your profile');
  }
  return id;
}
