export const RANK_TABS = ['ALL RANKS', 'ACTIVE', 'INACTIVE'];

export function filterRanks(rows, activeTab) {
  if (activeTab === 'ACTIVE') return rows.filter((row) => row.status === 'active');
  if (activeTab === 'INACTIVE') return rows.filter((row) => row.status === 'inactive');
  return rows;
}
