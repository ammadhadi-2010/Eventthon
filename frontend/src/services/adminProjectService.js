import API from '../api/axiosConfig';

export async function fetchAdminProjectStats() {
  const { data } = await API.get('/api/admin/projects/stats');
  return {
    metrics: data?.metrics || {},
    timeline: Array.isArray(data?.timeline) ? data.timeline : [],
    statusSlices: Array.isArray(data?.statusSlices) ? data.statusSlices : [],
  };
}

export async function fetchAdminProjects(params = {}) {
  const { data } = await API.get('/api/admin/projects', { params });
  return Array.isArray(data?.data) ? data.data : [];
}

export async function fetchAdminProjectDetail(projectId) {
  const { data } = await API.get(`/api/admin/projects/${encodeURIComponent(projectId)}`);
  return data?.data || null;
}

export async function updateAdminProject(projectId, payload) {
  const { data } = await API.put(`/api/admin/projects/${encodeURIComponent(projectId)}`, payload);
  return data?.data || null;
}

export async function patchAdminProjectStatus(projectId, status) {
  const { data } = await API.patch(`/api/admin/projects/${encodeURIComponent(projectId)}/status`, {
    status,
  });
  return data?.data || null;
}

export async function archiveAdminProject(projectId) {
  const { data } = await API.patch(`/api/admin/projects/${encodeURIComponent(projectId)}/archive`);
  return data?.data || null;
}
