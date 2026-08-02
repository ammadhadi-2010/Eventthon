import API from '../../api/axiosConfig';

const TIMEOUT = 15000;

function adminSessionHeaders() {
  const headers = {};
  const email = localStorage.getItem('userEmail');
  const mobile = localStorage.getItem('userMobile');
  if (email) headers['X-User-Email'] = email;
  if (mobile) headers['X-User-Mobile'] = mobile;
  return headers;
}

const adminOpts = (config = {}) => ({
  timeout: TIMEOUT,
  ...config,
  headers: { ...adminSessionHeaders(), ...(config.headers || {}) },
});

export async function fetchPublicDonationConfig() {
  const { data } = await API.get('/api/donations/config', { timeout: TIMEOUT });
  return data?.data || null;
}

export async function logDonationIntent(payload) {
  const { data } = await API.post('/api/donations/intents', payload, { timeout: TIMEOUT });
  return data?.data || null;
}

export async function fetchAdminDonationConfig() {
  const { data } = await API.get('/api/donations/admin/config', adminOpts());
  return data?.data || null;
}

export async function saveAdminDonationSettings(payload) {
  const { data } = await API.put('/api/donations/admin/settings', payload, adminOpts());
  return data?.data || null;
}

export async function saveAdminDonationCause(payload) {
  const { data } = await API.post('/api/donations/admin/causes', payload, adminOpts());
  return data?.data || null;
}

export async function deleteAdminDonationCause(causeId) {
  const { data } = await API.delete(`/api/donations/admin/causes/${encodeURIComponent(causeId)}`, adminOpts());
  return data?.data || null;
}

export async function saveAdminDonationOrganization(payload) {
  const { data } = await API.post('/api/donations/admin/organizations', payload, adminOpts());
  return data?.data || null;
}

export async function deleteAdminDonationOrganization(orgId) {
  const { data } = await API.delete(`/api/donations/admin/organizations/${encodeURIComponent(orgId)}`, adminOpts());
  return data?.data || null;
}

export async function fetchAdminDonationIntents(limit = 100) {
  const { data } = await API.get('/api/donations/admin/intents', adminOpts({ params: { limit } }));
  return Array.isArray(data?.data) ? data.data : [];
}

export async function uploadAdminDonationImage(file, slot = 'hero') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('slot', slot);
  const { data } = await API.post('/api/donations/admin/upload-image', formData, {
    timeout: TIMEOUT,
    headers: adminSessionHeaders(),
  });
  return data?.data || null;
}

export async function uploadAdminDonationOrgLogo(file, orgId = '') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('org_id', String(orgId || '').trim());
  const { data } = await API.post('/api/donations/admin/upload-org-logo', formData, {
    timeout: TIMEOUT,
    headers: adminSessionHeaders(),
  });
  return data?.data || null;
}
