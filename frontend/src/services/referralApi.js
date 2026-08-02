import API from '../api/axiosConfig';
import { getProfileSessionHeaders } from '../modules/Dashboard/Profile/utils/profileSession';

export async function fetchMyReferralSummary() {
  const { data } = await API.get('/api/referrals/summary/me', {
    headers: getProfileSessionHeaders(),
    timeout: 15000,
  });
  return data?.data || null;
}

export async function fetchReferralSummary(identifier) {
  const id = String(identifier || '').trim();
  if (!id) throw new Error('Login required');
  const { data } = await API.get(`/api/referrals/summary/${encodeURIComponent(id)}`, {
    headers: getProfileSessionHeaders(),
    timeout: 15000,
  });
  return data?.data || null;
}
