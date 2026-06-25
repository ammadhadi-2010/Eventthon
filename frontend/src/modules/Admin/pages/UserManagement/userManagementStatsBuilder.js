import { USER_MANAGEMENT_STATS } from './userManagementData';

const API_KEYS = {
  total: 'total',
  active: 'active',
  verified: 'verified',
  new: 'newThisMonth',
  suspended: 'suspended',
};

/**
 * Merges `/api/admin/users/stats` into stat card rows (labels, colors, icons preserved).
 */
export function buildStatsFromApi(apiStats) {
  if (!apiStats || typeof apiStats !== 'object') {
    return USER_MANAGEMENT_STATS;
  }
  return USER_MANAGEMENT_STATS.map((def) => {
    const key = API_KEYS[def.id];
    const block = key ? apiStats[key] : null;
    const value = block && typeof block.value === 'string' ? block.value : '—';
    return { ...def, value };
  });
}
