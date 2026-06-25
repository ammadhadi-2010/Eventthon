/** Session headers for Projects API ownership checks. */

export function getProjectsSessionHeaders() {
  const headers = {};
  const email = localStorage.getItem('userEmail');
  const mobile = localStorage.getItem('userMobile');
  if (email) headers['X-User-Email'] = email;
  if (mobile) headers['X-User-Mobile'] = mobile;
  return headers;
}

export function getProjectsActorId() {
  return String(
    localStorage.getItem('userEmail') ||
      localStorage.getItem('userMobile') ||
      localStorage.getItem('userId') ||
      localStorage.getItem('user_id') ||
      '',
  ).trim();
}

export function hasProjectsSession() {
  return Boolean(localStorage.getItem('userEmail') || localStorage.getItem('userMobile'));
}
