export function buildDonutGradient(items = []) {
  const total = items.reduce((sum, item) => sum + (item.value || 0), 0) || 1;
  let current = 0;
  const segments = items.map((item) => {
    const start = (current / total) * 360;
    current += item.value || 0;
    const end = (current / total) * 360;
    return `${item.color} ${start}deg ${end}deg`;
  });
  return `conic-gradient(${segments.join(', ')})`;
}

export function resolveActivityOverview(overview = [], hubMetrics = null) {
  if (overview.length) return overview;
  if (!hubMetrics) return [];
  return [
    { label: 'Projects', value: hubMetrics.projects || 0, color: '#3b82f6' },
    { label: 'Messages', value: hubMetrics.messages || 0, color: '#fb923c' },
    { label: 'Files', value: hubMetrics.files || 0, color: '#f97316' },
    { label: 'Members', value: hubMetrics.members || 0, color: '#fb7185' },
  ];
}
