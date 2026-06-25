import API from '../../../api/axiosConfig';

export async function fetchPublicUser(username) {
  const res = await API.get(`/api/public/users/${encodeURIComponent(username)}`);
  return res.data?.data;
}

export async function fetchPublicSquad(squadSlug) {
  const slug = String(squadSlug || '').trim();
  if (!slug) throw new Error('Squad slug required');
  const res = await API.get(`/api/public/squads/${encodeURIComponent(slug)}`);
  const body = res.data;
  if (body?.data) return body.data;
  if (body?.displayName) return body;
  throw new Error(body?.message || 'Public squad is unavailable.');
}

export async function fetchPublicGig(gigId) {
  const res = await API.get(`/api/public/gigs/${encodeURIComponent(gigId)}`);
  return res.data?.data;
}

export async function fetchPublicProject(projectId) {
  const res = await API.get(`/api/public/projects/${encodeURIComponent(projectId)}`);
  return res.data?.data;
}

export async function fetchPublicJob(jobId) {
  const res = await API.get(`/api/public/jobs/${encodeURIComponent(jobId)}`);
  return res.data?.data;
}

export async function fetchShowroomPanelLinks(ownerUserId = '') {
  const q = ownerUserId ? `?owner_user_id=${encodeURIComponent(ownerUserId)}` : '';
  const res = await API.get(`/api/public/showrooms/panel-links${q}`);
  return res.data;
}

export async function fetchPublicJobsBoard(query = '') {
  const q = query ? `?q=${encodeURIComponent(query)}` : '';
  const res = await API.get(`/api/public/jobs/board${q}`);
  return res.data;
}

export async function fetchPublicShowroomPanel(ownerUserId = '') {
  return fetchShowroomPanelLinks(ownerUserId);
}
