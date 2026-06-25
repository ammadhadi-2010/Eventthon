import API from '../../../../api/axiosConfig';
import { resolveCompanyPortalUserId } from '../../../../components/views/company/utils/companyWorkspaceCache';

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
