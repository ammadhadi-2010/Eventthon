import API from '../../../../api/axiosConfig';
import { assertProfileIdentifier, getProfileSessionHeaders } from '../utils/profileSession';

export async function fetchProfileOverviewData(identifier) {
  const id = assertProfileIdentifier(identifier);
  const res = await API.get(`/api/profile/overview-data/${encodeURIComponent(id)}`, {
    headers: getProfileSessionHeaders(),
    timeout: 15000,
  });
  return res.data;
}

export async function fetchProfileNetworkList(identifier, listKey, { page = 1, limit = 20, q = '' } = {}) {
  const id = assertProfileIdentifier(identifier);
  const res = await API.get(
    `/api/profile/network/${encodeURIComponent(id)}/${encodeURIComponent(listKey)}`,
    {
      params: { page, limit, q },
      headers: getProfileSessionHeaders(),
      timeout: 15000,
    },
  );
  return res.data;
}

export async function postProfileSocialAction(identifier, body) {
  const id = assertProfileIdentifier(identifier);
  const res = await API.post(
    `/api/profile/social/${encodeURIComponent(id)}/action`,
    body,
    { headers: { ...getProfileSessionHeaders(), 'Content-Type': 'application/json' }, timeout: 15000 },
  );
  return res.data;
}
