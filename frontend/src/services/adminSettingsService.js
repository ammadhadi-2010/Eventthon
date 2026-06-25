import API from '../api/axiosConfig';

export async function fetchGeneralSettings() {
  const { data } = await API.get('/api/admin/settings/general');
  return data?.settings || null;
}

export async function saveGeneralSettings(payload) {
  const { data } = await API.put('/api/admin/settings/general', payload);
  return data?.settings || null;
}
