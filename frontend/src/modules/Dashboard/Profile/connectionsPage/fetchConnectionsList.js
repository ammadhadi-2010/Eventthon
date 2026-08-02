import { resolveMediaUrl } from '../../../../components/shared/utils/resolveMediaUrl';
import {
  fetchProfileNetworkList,
  fetchProfileOverviewData,
} from '../services/profileOverviewService';
import { getListPageMeta, isValidListKey } from './connectionsListConfig';

function avatarOrFallback(url, seed) {
  const resolved = resolveMediaUrl(url || '');
  if (resolved) return resolved;
  return `https://api.dicebear.com/8.x/avataaars/svg?seed=${encodeURIComponent(seed || 'member')}`;
}

function normalizeRow(row) {
  const seed = row.name || row.id || 'member';
  return {
    ...row,
    avatarUrl: avatarOrFallback(row.avatarUrl, seed),
    name: row.name || 'Member',
    headline: row.headline || 'Developer',
    squadLine: row.squadLine || '',
    followersLabel: row.followersLabel || '',
    connectionsLabel: row.connectionsLabel || '',
    online: Boolean(row.online),
    profilePath: '/profile/view',
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

  const stats = { ...(bundle?.stats || {}) };
  const items = (networkRes?.items || []).map(normalizeRow);
  const apiTotal = Number(networkRes?.total);
  const totalAll = Number.isFinite(apiTotal) ? apiTotal : items.length;

  // Keep page title / sidebar counts aligned with the list API
  if (key === 'commanders') stats.top_commanders = totalAll;
  if (key === 'mutual') stats.connections_mutual = totalAll;
  if (key === 'followers') stats.followers = totalAll;
  if (key === 'following') stats.following = totalAll;
  if (key === 'connections') stats.connections = totalAll;

  const meta = getListPageMeta(key, stats);

  return { items, bundle, stats, meta, listKey: key, totalAll };
}
