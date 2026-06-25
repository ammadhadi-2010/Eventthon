import { API_BASE_URL } from '../../../../api/axiosConfig';
import {
  fetchProfileNetworkList,
  fetchProfileOverviewData,
} from '../services/profileOverviewService';
import { getListPageMeta, isValidListKey } from './connectionsListConfig';

function resolveAvatarUrl(url) {
  const v = String(url || '').trim();
  if (!v) return '';
  if (v.startsWith('http') || v.startsWith('blob:')) return v;
  return `${API_BASE_URL}${v.startsWith('/') ? v : `/${v}`}`;
}

function normalizeRow(row) {
  const seed = row.name || row.id || 'member';
  return {
    ...row,
    avatarUrl: resolveAvatarUrl(row.avatarUrl) || row.avatarUrl,
    name: row.name || 'Member',
    headline: row.headline || 'Developer',
    squadLine: row.squadLine || '',
    followersLabel: row.followersLabel || '',
    connectionsLabel: row.connectionsLabel || '',
    online: Boolean(row.online),
  };
}

/**
 * Loads a networking list from the profile network API (real graph data).
 */
export async function fetchConnectionsList({ identifier, listKey }) {
  if (!identifier) throw new Error('identifier required');
  const key = isValidListKey(listKey) ? listKey : 'commanders';
  const limit = key === 'mutual' ? 40 : 50;

  const [networkRes, bundle] = await Promise.all([
    fetchProfileNetworkList(identifier, key, { page: 1, limit }),
    fetchProfileOverviewData(identifier),
  ]);

  const stats = bundle?.stats || {};
  const meta = getListPageMeta(key, stats);
  const items = (networkRes?.items || []).map(normalizeRow);
  const totalAll = Number(networkRes?.total ?? meta.totalFromStats(stats)) || items.length;

  return { items, bundle, stats, meta, listKey: key, totalAll };
}
