/** Session headers for Squads API ownership checks. */

export function getSquadsSessionHeaders() {
  const headers = {};
  const email = localStorage.getItem('userEmail');
  const mobile = localStorage.getItem('userMobile');
  if (email) headers['X-User-Email'] = email;
  if (mobile) headers['X-User-Mobile'] = mobile;
  return headers;
}

export function getSquadsActorId() {
  return String(
    localStorage.getItem('userEmail') ||
      localStorage.getItem('userMobile') ||
      localStorage.getItem('userId') ||
      localStorage.getItem('user_id') ||
      localStorage.getItem('_id') ||
      '',
  ).trim();
}

export function hasSquadsSession() {
  return Boolean(localStorage.getItem('userEmail') || localStorage.getItem('userMobile'));
}
