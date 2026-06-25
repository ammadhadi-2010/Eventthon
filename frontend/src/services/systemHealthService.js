import API from '../api/axiosConfig';

const TIMEOUT_MS = 12000;
const POLL_MS = 60000;

function adminSessionHeaders() {
  const headers = {};
  const email = localStorage.getItem('userEmail');
  const mobile = localStorage.getItem('userMobile');
  if (email) headers['X-User-Email'] = email;
  if (mobile) headers['X-User-Mobile'] = mobile;
  return headers;
}

export async function fetchSystemHealth() {
  const res = await API.get('/api/admin/system-health', {
    timeout: TIMEOUT_MS,
    headers: adminSessionHeaders(),
  });
  return res?.data || null;
}

export { POLL_MS as SYSTEM_HEALTH_POLL_MS };
