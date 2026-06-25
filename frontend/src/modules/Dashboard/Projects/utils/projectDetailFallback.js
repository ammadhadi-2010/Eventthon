import { FEATURED_PROJECTS, MY_PROJECTS_ROWS } from '../data/projectsHubData';
import { normalizeProjectView } from './projectViewModel';

function rowToDetail(row) {
  return normalizeProjectView({
    ...row,
    detailed_description:
      row.detailed_description ||
      row.description ||
      `${row.title || row.name} — collaborate with verified teams on EventThon.`,
    agency: row.agency || 'EventThon Studio',
    rating: 4.8,
    reviews_count: 12,
  });
}

export function findProjectDetailFallback(projectId) {
  const pools = [...FEATURED_PROJECTS, ...MY_PROJECTS_ROWS];
  const hit = pools.find((p) => p.id === projectId);
  return hit ? rowToDetail(hit) : null;
}
