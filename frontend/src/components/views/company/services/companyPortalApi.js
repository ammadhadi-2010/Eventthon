import API from '../../../../api/axiosConfig';
import { resolveCompanyPortalUserId } from '../utils/companyWorkspaceCache';

export async function fetchCompanyPortalDashboard() {
  const user_id = resolveCompanyPortalUserId();
  if (!user_id || user_id.length < 2) {
    throw new Error('Sign in to open the company panel.');
  }
  const { data } = await API.get(
    `/api/company-portal/dashboard?user_id=${encodeURIComponent(user_id)}`,
    { timeout: 15000 },
  );
  return data?.data || null;
}

export async function submitCompanyPortalRegistration(payload) {
  const fd = new FormData();
  Object.entries(payload || {}).forEach(([key, value]) => {
    if (value == null || value === "") return;
    fd.append(key, value);
  });
  const { data } = await API.post("/api/company-portal/register", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data?.data || null;
}

export async function updateCompanySettings(payload) {
  const fd = new FormData();
  Object.entries(payload || {}).forEach(([key, value]) => {
    if (value == null || value === '') return;
    fd.append(key, value);
  });
  const { data } = await API.put('/api/company/settings', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data?.data || null;
}

function requireUserId() {
  const user_id = resolveCompanyPortalUserId();
  if (!user_id || user_id.length < 2) {
    throw new Error('Sign in to open the company panel.');
  }
  return user_id;
}

export async function fetchCompanyJobs({ status = 'all', q = '', skip = 0, limit = 50 } = {}) {
  const user_id = requireUserId();
  const { data } = await API.get('/api/company-portal/jobs', {
    params: { user_id, status, q, skip, limit },
    timeout: 20000,
  });
  return data?.data || { jobs: [], total: 0, counts: {} };
}

export async function fetchCompanyJob(jobId) {
  const user_id = requireUserId();
  const { data } = await API.get(`/api/company-portal/jobs/${encodeURIComponent(jobId)}`, {
    params: { user_id },
    timeout: 15000,
  });
  return data?.data || null;
}

export async function createCompanyJob(payload) {
  const user_id = requireUserId();
  const { data } = await API.post(
    '/api/company-portal/jobs',
    { ...payload, user_id },
    { timeout: 20000 },
  );
  return data?.data || null;
}

export async function updateCompanyJob(jobId, payload) {
  const user_id = requireUserId();
  const { data } = await API.put(
    `/api/company-portal/jobs/${encodeURIComponent(jobId)}`,
    { ...payload, user_id },
    { timeout: 20000 },
  );
  return data?.data || null;
}

export async function setCompanyJobStatus(jobId, status) {
  const user_id = requireUserId();
  const { data } = await API.patch(
    `/api/company-portal/jobs/${encodeURIComponent(jobId)}/status`,
    { user_id, status },
    { timeout: 15000 },
  );
  return data?.data || null;
}

export async function fetchCompanyApplications({ status = 'all', jobId = '', skip = 0, limit = 80 } = {}) {
  const user_id = requireUserId();
  const { data } = await API.get('/api/company-portal/applications', {
    params: { user_id, status, job_id: jobId, skip, limit },
    timeout: 20000,
  });
  return data?.data || { applications: [], total: 0, counts: {} };
}

export async function setCompanyApplicationStatus(appId, status) {
  const user_id = requireUserId();
  const { data } = await API.patch(
    `/api/company-portal/applications/${encodeURIComponent(appId)}/status`,
    { user_id, status },
    { timeout: 15000 },
  );
  return data?.data || null;
}

export async function fetchCompanySavedCandidates() {
  const user_id = requireUserId();
  const { data } = await API.get('/api/company-portal/saved-candidates', {
    params: { user_id },
    timeout: 15000,
  });
  return data?.data || { candidates: [], total: 0 };
}

export async function saveCompanyCandidate(payload) {
  const user_id = requireUserId();
  const { data } = await API.post(
    '/api/company-portal/saved-candidates',
    { ...payload, user_id },
    { timeout: 15000 },
  );
  return data || null;
}

export async function unsaveCompanyCandidate(candidateUserId) {
  const user_id = requireUserId();
  const { data } = await API.delete(
    `/api/company-portal/saved-candidates/${encodeURIComponent(candidateUserId)}`,
    { params: { user_id }, timeout: 15000 },
  );
  return data || null;
}

export async function fetchCompanyFollowers({ q = '', skip = 0, limit = 80 } = {}) {
  const user_id = requireUserId();
  const { data } = await API.get('/api/company-portal/followers', {
    params: { user_id, q, skip, limit },
    timeout: 20000,
  });
  return data?.data || { followers: [], total: 0, counts: {} };
}

export async function removeCompanyFollower(followerUserId) {
  const user_id = requireUserId();
  const { data } = await API.delete(
    `/api/company-portal/followers/${encodeURIComponent(followerUserId)}`,
    { params: { user_id }, timeout: 15000 },
  );
  return data || null;
}

export async function followCompany(companyId) {
  const user_id = requireUserId();
  const { data } = await API.post(
    '/api/company-portal/follow',
    { user_id, company_id: companyId },
    { timeout: 15000 },
  );
  return data || null;
}

export async function unfollowCompany(companyId) {
  const user_id = requireUserId();
  const { data } = await API.delete(
    `/api/company-portal/follow/${encodeURIComponent(companyId)}`,
    { params: { user_id }, timeout: 15000 },
  );
  return data || null;
}
