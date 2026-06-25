export function toggleListSelection(current, value) {
  if (value === 'All Types' || value === 'All Priorities') return [];
  return current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
}

function normalizeAlertItem(item) {
  const category = String(item.category || '').toLowerCase();
  let uiType = 'All Types';
  if (category === 'squad' || category === 'squads') uiType = 'Squad Alerts';
  else if (category === 'mentions') uiType = 'Mentions';
  else if (category === 'security') uiType = 'Security Alerts';
  else if (category === 'projects') uiType = 'Project Updates';
  else if (category === 'system') uiType = 'System Alerts';
  else if (category === 'jobs' || category === 'gigs') uiType = 'Job Alerts';

  return {
    ...item,
    category: category === 'squads' ? 'squad' : category === 'gigs' ? 'jobs' : category,
    uiType,
    uiPriority:
      item.priority === 'high'
        ? 'High'
        : item.priority === 'medium'
          ? 'Medium'
          : item.priority === 'low'
            ? 'Low'
            : 'All Priorities',
  };
}

export function buildDisplayAlerts({
  alerts,
  activeCategory,
  onlyUnread,
  selectedTypes,
  selectedPriorities,
  searchQuery,
}) {
  const normalized = alerts.map(normalizeAlertItem);
  const filtered = normalized.filter((item) => {
    if (activeCategory !== 'all' && item.category !== activeCategory) return false;
    if (onlyUnread && item.is_read) return false;
    if (selectedTypes.length && !selectedTypes.includes(item.uiType)) return false;
    if (selectedPriorities.length && !selectedPriorities.includes(item.uiPriority)) return false;
    return true;
  });

  const needle = searchQuery.trim().toLowerCase();
  if (!needle) return filtered;

  return filtered.filter((item) => {
    const hay = `${item.title || ''} ${item.message || ''}`.toLowerCase();
    return hay.includes(needle);
  });
}
