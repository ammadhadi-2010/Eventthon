import API from '../api/axiosConfig';

export async function fetchAdminJobMetrics() {
  const { data } = await API.get('/api/admin/jobs/metrics');
  return data?.metrics || { total: 0, active: 0, pending: 0, expired: 0, companies: 0 };
}

export async function fetchAdminJobs(params = {}) {
  const qs = new URLSearchParams();
  if (params.q) qs.set('q', params.q);
  if (params.status && params.status !== 'all') qs.set('status', params.status);
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  const query = qs.toString();
  const { data } = await API.get(`/api/admin/jobs${query ? `?${query}` : ''}`);
  return {
    rows: Array.isArray(data?.data) ? data.data : [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    limit: data?.limit ?? 20,
  };
}

export async function fetchAdminJobDetail(jobId) {
  const { data } = await API.get(`/api/admin/jobs/${encodeURIComponent(jobId)}`);
  return data?.data || null;
}

export async function patchAdminJobStatus(jobId, status) {
  const { data } = await API.patch('/api/admin/jobs/status', { job_id: jobId, status });
  return data?.data || null;
}

export async function updateAdminJob(jobId, payload) {
  const { data } = await API.put(`/api/admin/jobs/${encodeURIComponent(jobId)}`, payload);
  return data?.data || null;
}

export async function deleteAdminJob(jobId) {
  const { data } = await API.delete(`/api/admin/jobs/${encodeURIComponent(jobId)}`);
  return data || {};
}

export async function fetchAdminJobApplications() {
  const { data } = await API.get('/api/admin/jobs/applications');
  return {
    rows: Array.isArray(data?.data) ? data.data : [],
    total: data?.total ?? 0,
  };
}

export async function patchAdminJobApplication(applicationId, status) {
  const { data } = await API.patch(
    `/api/admin/jobs/applications/${encodeURIComponent(applicationId)}`,
    { status },
  );
  return data?.data || null;
}

export async function fetchAdminJobAlerts() {
  const { data } = await API.get('/api/admin/jobs/alerts');
  return {
    rows: Array.isArray(data?.data) ? data.data : [],
    total: data?.total ?? 0,
  };
}
