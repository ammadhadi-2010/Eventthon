import API from '../api/axiosConfig';

export async function fetchAdminRanks() {
  const { data } = await API.get('/api/admin/ranks');
  return Array.isArray(data?.rows) ? data.rows : [];
}

export async function fetchAdminRankDetail(rankId) {
  const { data } = await API.get(`/api/admin/ranks/${encodeURIComponent(rankId)}`);
  return data?.rank || null;
}

export async function createAdminRank(payload) {
  const { data } = await API.post('/api/admin/ranks', payload);
  return data?.rank || null;
}

export async function saveAdminRank(rankId, payload) {
  const { data } = await API.put(`/api/admin/ranks/${encodeURIComponent(rankId)}`, payload);
  return data?.rank || null;
}

export async function updateAdminRank(rankId, payload) {
  return saveAdminRank(rankId, payload);
}

export async function updateAdminRankStatus(rankId, status) {
  const { data } = await API.patch(`/api/admin/ranks/${encodeURIComponent(rankId)}/status`, { status });
  return data?.rank || null;
}
