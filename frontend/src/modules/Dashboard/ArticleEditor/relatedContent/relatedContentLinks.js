/** Dashboard routes for attached related content items. */
export function getRelatedItemPath(categoryKey, item = {}) {
  const id = String(item.id || '').trim();
  const label = String(item.label || '').trim();
  if (!id && !label) return null;

  const encodedId = encodeURIComponent(id);
  switch (categoryKey) {
    case 'squads':
      return `/squads/${encodedId}`;
    case 'projects':
      return `/projects/${encodedId}`;
    case 'jobs':
      return `/jobs/browse?highlight=${encodedId}`;
    case 'gigs':
      return `/gigs/explorer?gig=${encodedId}`;
    case 'members':
      return `/public/users/${encodeURIComponent(label || id)}`;
    case 'articles':
      return `/article/view/${encodedId}`;
    default:
      return null;
  }
}

export const RELATED_TAB_SHORT_LABELS = {
  squads: 'Squads',
  projects: 'Projects',
  jobs: 'Jobs',
  gigs: 'Gigs',
  members: 'Members',
  articles: 'Articles',
};
