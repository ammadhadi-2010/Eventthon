import API from '../../../api/axiosConfig';
import { getProfileIdentifier, getProfileSessionHeaders } from '../Profile/utils/profileSession';

export async function fetchAccountSettings(userData) {
  const identifier = getProfileIdentifier(userData);
  const { data } = await API.get(`/api/profile/account-settings/${encodeURIComponent(identifier)}`, {
    headers: getProfileSessionHeaders(),
  });
  return data?.data || null;
}

export async function saveAccountSettings(userData, payload) {
  const identifier = getProfileIdentifier(userData);
  const { data } = await API.put(
    `/api/profile/account-settings/${encodeURIComponent(identifier)}`,
    {
      full_name: payload.fullName,
      email: payload.email,
      password: payload.password || undefined,
      confirm_password: payload.verifyPassword || undefined,
    },
    { headers: getProfileSessionHeaders() },
  );
  return data?.data || null;
}
