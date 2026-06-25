export const COLLABORATIONS_TABS = [
  { id: 'all', label: 'All', count: 12 },
  { id: 'collaborator', label: 'As Collaborator', count: 8 },
  { id: 'owner', label: 'As Owner', count: 4 },
];

export function filterCollaborationsByTab(rows, tabId) {
  if (tabId === 'all') return rows;
  if (tabId === 'collaborator') return rows.filter((r) => r.roleType === 'collaborator');
  if (tabId === 'owner') return rows.filter((r) => r.roleType === 'owner');
  return rows;
}
