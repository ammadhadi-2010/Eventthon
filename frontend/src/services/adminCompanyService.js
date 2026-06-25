import API from '../api/axiosConfig';

export async function fetchCompanyMetrics() {
  const { data } = await API.get('/api/admin/companies/metrics');
  return data?.metrics || {};
}

export async function fetchAdminCompanies(params = {}) {
  const qs = new URLSearchParams();
  if (params.q) qs.set('q', params.q);
  if (params.status && params.status !== 'all') qs.set('status', params.status);
  if (params.industry && params.industry !== 'all') qs.set('industry', params.industry);
  if (params.size && params.size !== 'all') qs.set('size', params.size);
  const query = qs.toString();
  const { data } = await API.get(`/api/admin/companies${query ? `?${query}` : ''}`);
  return {
    rows: Array.isArray(data?.data) ? data.data : [],
    total: data?.total ?? 0,
  };
}

export async function fetchCompanyDetail(companyId) {
  const { data } = await API.get(`/api/admin/companies/${encodeURIComponent(companyId)}`);
  return data?.data || null;
}

export async function createAdminCompany(payload) {
  const { data } = await API.post('/api/admin/companies', payload);
  return data?.data || null;
}

export async function updateAdminCompany(companyId, payload) {
  const { data } = await API.patch(`/api/admin/companies/${encodeURIComponent(companyId)}`, payload);
  return data?.data || null;
}

export async function deleteAdminCompany(companyId) {
  const { data } = await API.delete(`/api/admin/companies/${encodeURIComponent(companyId)}`);
  return data || {};
}

export async function patchAdminCompanyStatus(companyId, action) {
  const { data } = await API.patch(
    `/api/admin/company/${encodeURIComponent(companyId)}/status`,
    { action },
  );
  return data?.data || null;
}

export async function deleteAdminCompanySingular(companyId) {
  const { data } = await API.delete(`/api/admin/company/${encodeURIComponent(companyId)}`);
  return data || {};
}

export async function fetchRecentCompanies(limit = 5) {
  const { data } = await API.get(`/api/admin/companies/recent?limit=${limit}`);
  return Array.isArray(data?.data) ? data.data : [];
}

export async function fetchCompanyVerificationRequests(limit = 5) {
  const { data } = await API.get(`/api/admin/companies/verification-requests?limit=${limit}`);
  return Array.isArray(data?.data) ? data.data : [];
}
