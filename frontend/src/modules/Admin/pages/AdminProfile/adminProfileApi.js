import API from '../../../../api/axiosConfig';

const TIMEOUT_MS = 12000;

function getAdminProfileSessionHeaders() {
  const headers = {};
  const email = localStorage.getItem('userEmail');
  const mobile = localStorage.getItem('userMobile');
  if (email) headers['X-User-Email'] = email;
  if (mobile) headers['X-User-Mobile'] = mobile;
  return headers;
}

export async function fetchAdminProfileCore() {
  const res = await API.get('/api/admin/profile', {
    timeout: TIMEOUT_MS,
    headers: getAdminProfileSessionHeaders(),
  });
  return res?.data?.data || null;
}

export async function runAdminProfileCommand(actionKey) {
  const res = await API.post(
    `/api/admin/profile/commands/${encodeURIComponent(actionKey)}`,
    {},
    { timeout: TIMEOUT_MS, headers: getAdminProfileSessionHeaders() },
  );
  return res?.data || null;
}

export async function updateAdminProfile(formData) {
  const res = await API.put('/api/admin/profile/update', formData, {
    timeout: 20000,
    headers: getAdminProfileSessionHeaders(),
  });
  return res?.data || null;
}
