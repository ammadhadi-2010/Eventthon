/** Session headers for member/employer alerts API ownership checks. */

export function getAlertsSessionHeaders() {
  const headers = {};
  const email = localStorage.getItem('userEmail');
  const mobile = localStorage.getItem('userMobile');
  if (email) headers['X-User-Email'] = email;
  if (mobile) headers['X-User-Mobile'] = mobile;
  return headers;
}

export function getAlertsIdentifier(userData) {
  return String(
    userData?.email ||
      userData?.mobile ||
      userData?.user_id ||
      localStorage.getItem('userEmail') ||
      localStorage.getItem('userMobile') ||
      localStorage.getItem('userId') ||
      '',
  ).trim();
}

export function hasAlertsSession() {
  return Boolean(localStorage.getItem('userEmail') || localStorage.getItem('userMobile'));
}
