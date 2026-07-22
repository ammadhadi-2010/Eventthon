export const RELATED_CONTENT_KEYS = [
  'squads',
  'projects',
  'jobs',
  'gigs',
  'members',
  'articles',
];

export const EMPTY_RELATED_CONTENT = {
  squads: [],
  projects: [],
  jobs: [],
  gigs: [],
  members: [],
  articles: [],
};

export const RELATED_CATEGORIES = [
  {
    key: 'squads',
    title: 'Related Squads',
    icon: '👥',
    accent: 'green',
    placeholder: 'Search squads...',
  },
  {
    key: 'projects',
    title: 'Related Projects',
    icon: '🚀',
    accent: 'blue',
    placeholder: 'Search projects...',
  },
  {
    key: 'jobs',
    title: 'Related Jobs',
    icon: '💼',
    accent: 'amber',
    placeholder: 'Search jobs...',
  },
  {
    key: 'gigs',
    title: 'Related Gigs',
    icon: '🎯',
    accent: 'pink',
    placeholder: 'Search gigs...',
  },
  {
    key: 'members',
    title: 'Related Members',
    icon: '👤',
    accent: 'purple',
    placeholder: 'Search members...',
  },
  {
    key: 'articles',
    title: 'Related Articles',
    icon: '📖',
    accent: 'violet',
    placeholder: 'Search articles...',
  },
];

export function normalizeRelatedContent(raw) {
  const base = { ...EMPTY_RELATED_CONTENT };
  if (!raw || typeof raw !== 'object') return base;
  RELATED_CONTENT_KEYS.forEach((key) => {
    const rows = Array.isArray(raw[key]) ? raw[key] : [];
    base[key] = rows
      .map((row) => ({
        id: String(row?.id || row?._id || '').trim(),
        label: String(row?.label || row?.title || row?.name || '').trim(),
      }))
      .filter((row) => row.id && row.label);
  });
  return base;
}
