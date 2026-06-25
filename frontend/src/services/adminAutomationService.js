import API from '../api/axiosConfig';

export async function fetchAutomationMetrics() {
  const { data } = await API.get('/api/admin/automation/metrics');
  return data?.metrics || {};
}

export async function fetchAutomationPosts(params = {}) {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  const query = qs.toString();
  const { data } = await API.get(`/api/admin/automation/posts${query ? `?${query}` : ''}`);
  return {
    rows: Array.isArray(data?.data) ? data.data : [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    limit: data?.limit ?? 10,
  };
}

export async function createAutomationPost(formData) {
  const { data } = await API.post('/api/admin/automation/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data?.data || null;
}

export async function publishAutomationPost(postId) {
  const { data } = await API.post(`/api/admin/automation/posts/${encodeURIComponent(postId)}/publish`);
  return data?.data || null;
}

export async function patchAutomationPostStatus(postId, status) {
  const { data } = await API.patch(
    `/api/admin/automation/posts/${encodeURIComponent(postId)}/status?status=${encodeURIComponent(status)}`,
  );
  return data?.data || null;
}

export async function deleteAutomationPost(postId) {
  const { data } = await API.delete(`/api/admin/automation/posts/${encodeURIComponent(postId)}`);
  return data || {};
}

export async function fetchAutomationSettings() {
  const { data } = await API.get('/api/admin/automation/settings');
  return {
    platforms: data?.platforms || {},
    available: Array.isArray(data?.available) ? data.available : [],
  };
}

export async function saveAutomationSettings(platforms) {
  const { data } = await API.put('/api/admin/automation/settings', { platforms });
  return data?.platforms || platforms;
}

export async function generateAutomationCaption(payload) {
  const { data } = await API.post('/api/admin/automation/generate-caption', payload);
  return data?.caption || '';
}

export async function searchAutomationGoogleLeads(payload) {
  const { data } = await API.post('/api/admin/automation/google-search', payload);
  return data;
}

export async function extractAutomationLeads(payload) {
  const { data } = await API.post('/api/admin/automation/extract', payload);
  return data;
}

export async function sendAutomationPitch(payload) {
  const { data } = await API.post('/api/admin/automation/send-pitch', payload);
  return data;
}
