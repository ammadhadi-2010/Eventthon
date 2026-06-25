/** Jobs hub — signed-in user identifier (mobile or email). */
export function resolveJobsUserId() {
  if (typeof localStorage === 'undefined') return '';
  return localStorage.getItem('userMobile') || localStorage.getItem('userEmail') || '';
}

export function resolveJobsMongoUserId() {
  if (typeof localStorage === 'undefined') return '';
  return localStorage.getItem('userId') || localStorage.getItem('user_id') || '';
}

export function buildJobsAuthHeaders() {
  const headers = {};
  const mongoId = resolveJobsMongoUserId();
  const email = resolveJobsUserEmail();
  const mobile = resolveJobsUserId();
  if (mongoId) headers['X-User-Id'] = mongoId;
  if (email) headers['X-User-Email'] = email;
  if (mobile) headers['X-User-Mobile'] = mobile;
  return headers;
}

export function resolveJobsUserEmail() {
  if (typeof localStorage === 'undefined') return '';
  return localStorage.getItem('userEmail') || '';
}

export function isJobsUserSignedIn() {
  return resolveJobsUserId().length >= 2;
}
