import API from '../api/axiosConfig';

export async function fetchAdminSquadStats() {
  const { data } = await API.get('/api/admin/squads/stats');
  return data?.metrics || {};
}

export async function fetchAdminSquads(params = {}) {
  const { data } = await API.get('/api/admin/squads', { params });
  return Array.isArray(data?.data) ? data.data : [];
}

export async function fetchAdminSquadDetail(squadId) {
  const { data } = await API.get(`/api/admin/squads/${encodeURIComponent(squadId)}`);
  return data?.data || data;
}

export async function fetchAdminSquadMembers(squadId) {
  const { data } = await API.get(`/api/admin/squads/${encodeURIComponent(squadId)}/members`);
  return Array.isArray(data?.data) ? data.data : [];
}

export async function updateAdminSquadInfo(squadId, payload) {
  const { data } = await API.put(`/api/admin/squads/${encodeURIComponent(squadId)}`, payload);
  return data?.data || data;
}

export async function patchAdminSquadStatus(squadId, status) {
  const { data } = await API.patch(`/api/admin/squads/${encodeURIComponent(squadId)}/status`, { status });
  return data?.data || data;
}

export async function disbandAdminSquad(squadId) {
  const { data } = await API.delete(`/api/admin/squads/${encodeURIComponent(squadId)}`);
  return data;
}
