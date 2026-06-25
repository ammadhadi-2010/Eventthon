export const UPDATE_FILTERS = [
  { key: 'all', label: 'All Updates' },
  { key: 'project', label: 'Project' },
  { key: 'gig', label: 'Gig' },
  { key: 'achievement', label: 'Achievement' },
  { key: 'squad', label: 'Squad' },
  { key: 'job', label: 'Job' },
  { key: 'article', label: 'Article' },
];

export const UPDATE_THEMES = {
  project: {
    label: 'PROJECT UPDATE',
    color: '#10b981',
    glow: 'rgba(16, 185, 129, 0.22)',
    layout: 'square',
  },
  gig: {
    label: 'NEW GIG',
    color: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.22)',
    layout: 'square',
  },
  achievement: {
    label: 'ACHIEVEMENT',
    color: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.22)',
    layout: 'badge',
  },
  squad: {
    label: 'SQUAD ACTIVITY',
    color: '#3b82f6',
    glow: 'rgba(59, 130, 246, 0.22)',
    layout: 'round',
  },
  job: {
    label: 'JOB OPEN',
    color: '#ef4444',
    glow: 'rgba(239, 68, 68, 0.22)',
    layout: 'icon',
  },
  article: {
    label: 'ARTICLE',
    color: '#ec4899',
    glow: 'rgba(236, 72, 153, 0.22)',
    layout: 'square',
  },
};

export function themeForType(type) {
  return UPDATE_THEMES[type] || UPDATE_THEMES.article;
}
