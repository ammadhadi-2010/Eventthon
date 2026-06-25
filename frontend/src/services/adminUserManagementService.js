import API, { API_BASE_URL } from '../api/axiosConfig';

/**
 * Admin User Management API client (`/api/admin/users/*`).
 */

export async function fetchUserManagementStats() {
  const { data } = await API.get('/api/admin/users/stats');
  return data;
}

export async function fetchAdminUserDetail(lookup) {
  const params = {};
  if (typeof lookup === 'string') {
    params.mobile = lookup;
  } else if (lookup && typeof lookup === 'object') {
    if (lookup.mobile) params.mobile = lookup.mobile;
    if (lookup.email) params.email = lookup.email;
    if (lookup.id) params.id = lookup.id;
  }
  const { data } = await API.get('/api/admin/users/detail', { params });
  return data;
}

export async function fetchAdminVerificationRequest(mobile) {
  const { data } = await API.get(`/api/admin/users/${encodeURIComponent(mobile)}/verification-request`);
  return data;
}

export async function fetchUsersList({ tab = 'all', q = '', page = 1, pageSize = 10 } = {}) {
  const { data } = await API.get('/api/admin/users', {
    params: { tab, q, page, page_size: pageSize },
  });
  return data;
}

/** Triggers CSV download in the browser. */
export function downloadUsersExport({ tab = 'all', q = '' } = {}) {
  const params = new URLSearchParams({ tab, q });
  const url = `${API_BASE_URL}/api/admin/users/export?${params.toString()}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export async function createAdminUser(payload) {
  const { data } = await API.post('/api/admin/users', payload);
  return data;
}

export async function updateUserStatus(mobile, action, feedback = '') {
  const body = { action };
  const note = (feedback || '').trim();
  if (note) body.feedback = note;
  const { data } = await API.patch(`/api/admin/users/${encodeURIComponent(mobile)}/status`, body);
  return data;
}

export async function deleteAdminUser(mobile, hard = true) {
  const { data } = await API.delete(`/api/admin/users/${encodeURIComponent(mobile)}`, {
    params: { hard },
  });
  return data;
}
