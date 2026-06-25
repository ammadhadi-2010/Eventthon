import API from '../../../../api/axiosConfig';
import { getSquadsSessionHeaders } from '../services/squadsSession';

const TIMEOUT = 15000;
const LIST_TTL_MS = 30000;
const CREATE_PATHS = ['/api/squads/create', '/squads/create'];

let listCache = { at: 0, payload: null };

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
  if (data?.status === 'success' && Array.isArray(data?.data)) return data.data;
  return [];
}

export async function fetchSquadsList({ force = false } = {}) {
  const now = Date.now();
  if (!force && listCache.payload && now - listCache.at < LIST_TTL_MS) {
    return listCache.payload;
  }
  const res = await API.get('/api/squads', sessionConfig());
  const rows = normalizeSquadsList(res.data);
  const payload = { squads: rows, total: rows.length };
  listCache = { at: now, payload };
  return payload;
}

export function invalidateSquadsListCache() {
  listCache = { at: 0, payload: null };
}

export async function fetchSquadDetail(squadId) {
  const res = await API.get(`/squads/${squadId}`, sessionConfig());
  return res.data;
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
