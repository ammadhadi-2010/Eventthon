import API from '../api/axiosConfig';

export async function fetchAdminJobSettings() {
  const { data } = await API.get('/api/admin/settings/jobs');
  return data?.settings || null;
}

export async function saveAdminJobSettings(payload) {
  const { data } = await API.put('/api/admin/settings/jobs', payload);
  return data?.settings || null;
}

export async function fetchAdminOpportunitySettings() {
  const { data } = await API.get('/api/admin/settings/opportunities');
  return data?.settings || null;
}

export async function saveAdminOpportunitySettings(payload) {
  const { data } = await API.put('/api/admin/settings/opportunities', payload);
  return data?.settings || null;
}
