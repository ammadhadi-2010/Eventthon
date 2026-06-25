import API from '../../../../api/axiosConfig';
import { getSquadsSessionHeaders } from '../services/squadsSession';

const TIMEOUT = 10000;
const BUNDLE_TTL_MS = 20000;
const bundleCache = new Map();

function cfg(extra = {}) {
  return {
    timeout: TIMEOUT,
    headers: { ...getSquadsSessionHeaders(), ...(extra.headers || {}) },
    ...extra,
  };
}

function squadPath(squadId, suffix = '') {
  return `/squads/${squadId}${suffix}`;
}

function normalizeWorkspace(data) {
  const d = data?.data || data || {};
  return {
    messages: d.messages || [],
    members: d.members || [],
    projects: d.projects || [],
    files: d.files || [],
    activity: d.activity || [],
    activityFeed: d.activity_feed || d.activityFeed || [],
    activityOverview: d.activity_overview || d.activityOverview || [],
    topMembers: d.top_members || d.topMembers || [],
  };
}

/** One request replaces five parallel squad hub fetches. */
export async function loadSquadWorkspaceBundle(squadId, { force = false } = {}) {
  const key = String(squadId || '');
  if (!key) return normalizeWorkspace({});
  const cached = bundleCache.get(key);
  if (!force && cached && Date.now() - cached.at < BUNDLE_TTL_MS) {
    return cached.data;
  }
  try {
    const res = await API.get(squadPath(key, '/workspace'), cfg());
    if (res?.data?.status === 'success') {
      const data = normalizeWorkspace(res.data);
      bundleCache.set(key, { at: Date.now(), data });
      return data;
    }
  } catch (err) {
    if (err?.response?.status !== 404) throw err;
  }
  const [messagesRes, membersRes, projectsRes, filesRes, activityRes] = await Promise.all([
    API.get(squadPath(squadId, '/messages'), cfg()),
    API.get(squadPath(squadId, '/members'), cfg()),
    API.get(squadPath(squadId, '/projects'), cfg()),
    API.get(squadPath(squadId, '/files'), cfg()),
    API.get(squadPath(squadId, '/activity'), cfg()),
  ]);
  const data = {
    messages: messagesRes?.data?.data || [],
    members: membersRes?.data?.data || [],
    projects: projectsRes?.data?.data || [],
    files: filesRes?.data?.data || [],
    activity: activityRes?.data?.data || [],
    activityFeed: activityRes?.data?.feed || [],
    activityOverview: activityRes?.data?.overview || [],
    topMembers: activityRes?.data?.top_members || [],
  };
  bundleCache.set(key, { at: Date.now(), data });
  return data;
}

export async function fetchSquadProjectsOnly(squadId) {
  const res = await API.get(squadPath(squadId, '/projects'), cfg());
  return res?.data?.data || [];
}

export async function fetchSquadMembers(squadId) {
  const res = await API.get(squadPath(squadId, '/members'), cfg());
  return res?.data?.data || [];
}

export async function postSquadMessage(squadId, body) {
  const res = await API.post(squadPath(squadId, '/messages'), body, cfg());
  return res?.data;
}

export async function putSquadMessage(squadId, messageId, body) {
  const res = await API.put(squadPath(squadId, `/messages/${messageId}`), body, cfg());
  return res?.data;
}

export async function deleteSquadMessage(squadId, messageId, params) {
  await API.delete(squadPath(squadId, `/messages/${messageId}`), { ...cfg(), params });
}

export async function reactSquadMessage(squadId, messageId, body) {
  const res = await API.post(squadPath(squadId, `/messages/${messageId}/react`), body, cfg());
  return res?.data;
}

export async function leaveSquadApi(squadId, body) {
  await API.post(squadPath(squadId, '/leave'), body, cfg());
}

export async function createSquadProject(squadId, payload) {
  const res = await API.post(squadPath(squadId, '/projects'), payload, cfg());
  return res?.data;
}

export async function updateSquadProject(squadId, projectId, payload) {
  const res = await API.put(squadPath(squadId, `/projects/${projectId}`), payload, cfg());
  return res?.data;
}

export async function deleteSquadProject(squadId, projectId) {
  const res = await API.delete(squadPath(squadId, `/projects/${projectId}`), cfg());
  return res?.data;
}

export async function updateSquadMemberRole(squadId, memberId, role) {
  const res = await API.put(squadPath(squadId, `/members/${memberId}/role`), { role }, cfg());
  return res?.data;
}

export async function removeSquadMember(squadId, memberId) {
  const res = await API.delete(squadPath(squadId, `/members/${memberId}`), cfg());
  return res?.data;
}

export async function uploadSquadChatFile(squadId, formData) {
  const res = await API.post(squadPath(squadId, '/messages/upload'), formData, {
    ...cfg(),
    headers: { ...getSquadsSessionHeaders(), 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });
  return res?.data;
}

export async function deleteSquadFile(squadId, fileId) {
  const res = await API.delete(squadPath(squadId, `/files/${fileId}`), cfg());
  return res?.data;
}

export async function searchUsersBySkill(skill) {
  const res = await API.get('/users/search', { ...cfg(), params: { skill } });
  return Array.isArray(res.data) ? res.data : res.data?.data || [];
}

export async function approveSquadApplication(squadId, memberMobile, action) {
  const res = await API.post('/squads/approve', null, {
    ...cfg(),
    params: { squad_id: squadId, member_mobile: memberMobile, action },
  });
  return res?.data;
}
