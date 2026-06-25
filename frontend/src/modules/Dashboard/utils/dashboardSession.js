/** Session headers for dashboard hub metrics API. */

export function getDashboardSessionHeaders() {
  const headers = {};
  const email = localStorage.getItem('userEmail');
  const mobile = localStorage.getItem('userMobile');
  if (email) headers['X-User-Email'] = email;
  if (mobile) headers['X-User-Mobile'] = mobile;
  return headers;
}

export function getDashboardUserKey(userData) {
  return String(
    userData?._id ||
      userData?.email ||
      userData?.mobile ||
      localStorage.getItem('userEmail') ||
      localStorage.getItem('userMobile') ||
      '',
  ).trim();
}
