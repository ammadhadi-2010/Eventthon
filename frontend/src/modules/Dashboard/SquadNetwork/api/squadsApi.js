import API from '../../../../api/axiosConfig';
import { getSquadsSessionHeaders } from '../services/squadsSession';

const TIMEOUT = 15000;
const LIST_TTL_MS = 30000;
const CREATE_PATHS = ['/api/squads/create', '/squads/create'];

let listCache = { at: 0, key: '', payload: null };

function sessionConfig(extra = {}) {
  return {
    timeout: TIMEOUT,
    headers: { ...getSquadsSessionHeaders(), ...(extra.headers || {}) },
    ...extra,
  };
}

function normalizeSquadsList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.squads)) return data.squads;
  if (Array.isArray(data?.invites)) return data.invites;
  if (data?.status === 'success' && Array.isArray(data?.data)) return data.data;
  return [];
}

export async function fetchSquadsList({ force = false, scope = 'all' } = {}) {
  const now = Date.now();
  const key = String(scope || 'all');
  if (!force && listCache.payload && listCache.key === key && now - listCache.at < LIST_TTL_MS) {
    return listCache.payload;
  }
  const res = await API.get('/api/squads', {
    ...sessionConfig(),
    params: { scope: key },
  });
  const rows = normalizeSquadsList(res.data);
  const counts = res.data?.counts || {
    all: rows.length,
    mine: rows.filter((s) => s.membership === 'member').length,
    invites: rows.filter((s) => s.membership === 'pending').length,
  };
  const payload = { squads: rows, total: rows.length, counts, scope: key };
  listCache = { at: now, key, payload };
  return payload;
}

export function invalidateSquadsListCache() {
  listCache = { at: 0, key: '', payload: null };
}

export async function fetchMySquadInvites() {
  const res = await API.get('/api/squads/invites/mine', sessionConfig());
  return {
    invites: Array.isArray(res.data?.invites) ? res.data.invites : normalizeSquadsList(res.data),
    total: Number(res.data?.total || 0),
  };
}

export async function respondSquadInvite(squadId, action, userId) {
  const res = await API.post(
    `/squads/${squadId}/invites/respond`,
    { action, user_id: userId || undefined },
    {
      ...sessionConfig(),
      headers: { ...getSquadsSessionHeaders(), 'Content-Type': 'application/json' },
    },
  );
  invalidateSquadsListCache();
  return res.data;
}

export async function hireSquad(squadId, payload = {}) {
  const res = await API.post(`/squads/${squadId}/hire`, payload, {
    ...sessionConfig(),
    headers: { ...getSquadsSessionHeaders(), 'Content-Type': 'application/json' },
  });
  return res.data;
}

export async function fetchSquadDetail(squadId) {
  const res = await API.get(`/squads/${squadId}`, sessionConfig());
  return res.data;
}

export async function fetchSquadInvitePreview(squadId) {
  const res = await API.get(`/squads/${squadId}/invite-preview`, sessionConfig());
  return res.data?.data || res.data || null;
}

export async function createSquad(payload) {
  let lastError = null;
  for (const path of CREATE_PATHS) {
    try {
      const res = await API.post(path, payload, {
        ...sessionConfig(),
        headers: { ...getSquadsSessionHeaders(), 'Content-Type': 'application/json' },
      });
      invalidateSquadsListCache();
      return res.data;
    } catch (err) {
      lastError = err;
      if (err?.response?.status && err.response.status !== 404) throw err;
    }
  }
  throw lastError || new Error('Could not create squad');
}

export async function inviteSquadMember(squadId, payload) {
  const res = await API.post(`/squads/${squadId}/invite`, payload, {
    ...sessionConfig(),
    headers: { ...getSquadsSessionHeaders(), 'Content-Type': 'application/json' },
  });
  invalidateSquadsListCache();
  return res.data;
}

export async function updateSquadInfo(squadId, payload) {
  const res = await API.put(`/squads/${squadId}/info`, payload, sessionConfig());
  invalidateSquadsListCache();
  return res.data;
}

export async function updateSquadSettings(squadId, settings) {
  const res = await API.put(`/squads/${squadId}/settings`, { settings }, sessionConfig());
  return res.data;
}

export { squadsAbsoluteUrl } from '../utils/squadsMediaUrl';
