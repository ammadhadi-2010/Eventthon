import API from '../../../../../api/axiosConfig';

export async function fetchLeadHunterCategories() {
  const { data } = await API.get('/api/admin/automation/categories');
  return Array.isArray(data?.categories) ? data.categories : [];
}

export async function searchGoogleLeads(payload) {
  const { data } = await API.post('/api/admin/automation/google-search', payload);
  return data;
}

export async function extractLeads(payload) {
  const { data } = await API.post('/api/admin/automation/extract', payload);
  return data;
}

export async function sendPitch(payload) {
  const { data } = await API.post('/api/admin/automation/send-pitch', payload);
  return data;
}
