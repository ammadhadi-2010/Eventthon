export const MY_PROJECTS_TABS = [
  { id: 'all', label: 'All Projects', count: 8 },
  { id: 'in-progress', label: 'In Progress', count: 5 },
  { id: 'completed', label: 'Completed', count: 2 },
  { id: 'on-hold', label: 'On Hold', count: 1 },
];

export function filterMyProjectsByTab(rows, tabId) {
  if (tabId === 'all') return rows;
  if (tabId === 'in-progress') {
    return rows.filter((r) => r.status === 'in-progress' || r.status === 'in-review');
  }
  if (tabId === 'completed') return rows.filter((r) => r.status === 'completed');
  if (tabId === 'on-hold') return rows.filter((r) => r.status === 'on-hold');
  return rows;
}
