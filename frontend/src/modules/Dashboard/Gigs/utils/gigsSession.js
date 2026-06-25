/** Session headers for gigs API ownership checks. */

export function getGigsSessionHeaders() {
  const headers = {};
  const email = localStorage.getItem('userEmail');
  const mobile = localStorage.getItem('userMobile');
  if (email) headers['X-User-Email'] = email;
  if (mobile) headers['X-User-Mobile'] = mobile;
  return headers;
}

export function getGigsActorId() {
  return String(
    localStorage.getItem('userEmail') ||
      localStorage.getItem('userMobile') ||
      localStorage.getItem('userId') ||
      localStorage.getItem('user_id') ||
      '',
  ).trim();
}

export function hasGigsSession() {
  return Boolean(localStorage.getItem('userEmail') || localStorage.getItem('userMobile'));
}
