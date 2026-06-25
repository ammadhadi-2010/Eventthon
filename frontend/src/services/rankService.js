import API from '../api/axiosConfig';

export async function fetchRankMatrix() {
  const { data } = await API.get('/api/ranks/matrix');
  return Array.isArray(data?.rows) ? data.rows : [];
}

export async function fetchUserRankStatus(identifier) {
  const { data } = await API.get(`/api/ranks/status/${encodeURIComponent(identifier)}`);
  return data?.rank || null;
}

export async function fetchPublicRankStatus(identifier) {
  const { data } = await API.get(`/api/ranks/status/public/${encodeURIComponent(identifier)}`);
  return data || null;
}
