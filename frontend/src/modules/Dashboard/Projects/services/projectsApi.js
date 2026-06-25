import API from '../../../../api/axiosConfig';
import { getProjectsSessionHeaders } from './projectsSession';

const TIMEOUT = 30000;

function sessionConfig(extra = {}) {
  return {
    timeout: TIMEOUT,
    headers: { ...getProjectsSessionHeaders(), ...(extra.headers || {}) },
    ...extra,
  };
}

export async function fetchProjectsList(params = {}) {
  const res = await API.get('/api/projects', {
    ...sessionConfig(),
    params: { limit: 24, skip: 0, ...params },
  });
  return res.data;
}

export async function fetchProjectsHub(ownerUserId) {
  const res = await API.get('/api/projects/hub', {
    ...sessionConfig(),
    params: { owner_user_id: ownerUserId },
  });
  return res.data;
}

export async function fetchProjectDetail(projectId, ownerUserId) {
  const res = await API.get(`/api/projects/${projectId}`, {
    ...sessionConfig(),
    params: ownerUserId ? { owner_user_id: ownerUserId } : {},
  });
  return res.data?.project;
}

export async function fetchMyProjects(ownerUserId, tab = 'all') {
  const res = await API.get('/api/projects/my', {
    ...sessionConfig(),
    params: { owner_user_id: ownerUserId, tab },
  });
  return res.data;
}

export async function fetchExploreProjects(params) {
  const res = await API.get('/api/projects/explore', { ...sessionConfig(), params });
  return res.data;
}

export async function fetchCollaborations(userId) {
  const res = await API.get('/api/projects/collaborations', {
    ...sessionConfig(),
    params: { user_id: userId },
  });
  return res.data;
}

export async function fetchSavedProjects(userId) {
  const res = await API.get('/api/projects/saved', {
    ...sessionConfig(),
    params: { user_id: userId },
  });
  return res.data;
}

export async function saveProject(payload) {
  const res = await API.post('/api/projects/saved', payload, sessionConfig());
  return res.data;
}

export async function unsaveProject(savedId, userId) {
  const res = await API.delete(`/api/projects/saved/${savedId}`, {
    ...sessionConfig(),
    params: { user_id: userId },
  });
  return res.data;
}

export async function createHubProject(payload) {
  const res = await API.post('/api/projects/create', payload, {
    ...sessionConfig(),
    headers: { ...getProjectsSessionHeaders(), 'Content-Type': 'application/json' },
  });
  return res.data;
}

export async function submitProjectProposal(projectId, payload) {
  const res = await API.post(`/api/projects/${projectId}/proposals`, payload, {
    ...sessionConfig(),
    headers: { ...getProjectsSessionHeaders(), 'Content-Type': 'application/json' },
  });
  if (res?.data?.status !== 'success') {
    throw new Error(res?.data?.message || 'Could not submit proposal.');
  }
  return res.data;
}

export async function selectHubProjectPackage(projectId, payload) {
  const res = await API.post(`/api/projects/${projectId}/select-package`, payload, sessionConfig());
  if (res?.data?.status !== 'success') {
    throw new Error(res?.data?.message || 'Could not confirm package.');
  }
  return res.data;
}

export async function joinHubProject(projectId, userPayload) {
  const res = await API.post(`/api/projects/${projectId}/join`, userPayload, sessionConfig());
  if (res?.data?.status !== 'success') {
    throw new Error(res?.data?.message || 'Could not join project.');
  }
  return res.data;
}

export async function runProjectAction(projectId, ownerUserId, action) {
  const res = await API.post(
    `/api/projects/${projectId}/actions`,
    { owner_user_id: ownerUserId, action },
    sessionConfig(),
  );
  return res.data;
}

export async function fetchFunding(ownerUserId) {
  const res = await API.get('/api/projects/funding', {
    ...sessionConfig(),
    params: { owner_user_id: ownerUserId },
  });
  return res.data;
}

export async function fetchMilestones(ownerUserId) {
  const res = await API.get('/api/projects/milestones', {
    ...sessionConfig(),
    params: { owner_user_id: ownerUserId },
  });
  return res.data;
}

export async function fetchReports(ownerUserId) {
  const res = await API.get('/api/projects/reports', {
    ...sessionConfig(),
    params: { owner_user_id: ownerUserId },
  });
  return res.data;
}

export async function fetchProjectReviewsSummary(ownerUserId, limit = 5) {
  const res = await API.get('/api/projects/reviews/summary', {
    ...sessionConfig(),
    params: { owner_user_id: ownerUserId, limit },
  });
  return res.data;
}

export async function fetchProjectActivity(ownerUserId) {
  const res = await API.get('/api/projects/activity', {
    ...sessionConfig(),
    params: { owner_user_id: ownerUserId },
  });
  return res.data;
}

export async function fetchTopCollaborators(ownerUserId) {
  const res = await API.get('/api/projects/top-collaborators', {
    ...sessionConfig(),
    params: { owner_user_id: ownerUserId },
  });
  return res.data;
}

export async function postProjectReview(payload) {
  const res = await API.post('/api/projects/reviews/', payload, {
    ...sessionConfig(),
    headers: { ...getProjectsSessionHeaders(), 'Content-Type': 'application/json' },
  });
  return res.data;
}
