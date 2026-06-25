import { resolveDashboardMediaUrl } from '../utils/dashboardMedia';
import { UPDATE_ACTION_LABELS } from './updatesExplorerConfig';
import { themeForType } from './updateThemes';
import { formatUpdateTime } from './mapUpdatesFeed';
import { EXPLORER_DEMO_UPDATES } from './explorerDemoData';

export function mapExplorerRow(row) {
  const type = row.update_type || 'article';
  const theme = themeForType(type);
  const authorImage = resolveDashboardMediaUrl(row.author_imageurl || row.imageurl || '');
  let title = row.title || 'Platform update';
  if (type === 'project' && row.progress_percent != null) {
    title = `${title} (${row.progress_percent}% complete)`;
  }

  return {
    id: row.id || row._id,
    type,
    theme,
    title,
    message: row.message || '',
    imageurl: resolveDashboardMediaUrl(row.imageurl || ''),
    authorName: row.author_name || 'EventThon Member',
    authorTitle: row.author_title || 'Member',
    authorImageurl: authorImage,
    timeAgo: formatUpdateTime(row.created_at),
    createdAt: row.created_at || '',
    actionUrl: row.action_url || '',
    actionLabel: UPDATE_ACTION_LABELS[type] || 'View Update',
    likesCount: Number(row.likes_count || 0),
    commentsCount: Number(row.comments_count || 0),
    jobLocation: row.job_location || 'Remote',
    jobType: row.job_type || 'Full-time',
    jobExperience: row.job_experience || '2+ Years',
  };
}

export function buildExplorerList(apiRows = []) {
  const source = apiRows.length ? apiRows : EXPLORER_DEMO_UPDATES;
  const seen = new Set();
  return source
    .map(mapExplorerRow)
    .filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
}

export function matchesTimeFilter(item, timeKey) {
  if (timeKey === 'all' || !item.createdAt) return true;
  const date = new Date(item.createdAt);
  if (Number.isNaN(date.getTime())) return true;
  const diffMs = Date.now() - date.getTime();
  if (timeKey === 'today') return diffMs <= 24 * 3600000;
  if (timeKey === 'week') return diffMs <= 7 * 24 * 3600000;
  if (timeKey === 'month') return diffMs <= 30 * 24 * 3600000;
  return true;
}

export function sortExplorerItems(items, sortKey) {
  const rows = [...items];
  rows.sort((a, b) => {
    const aTime = new Date(a.createdAt || 0).getTime();
    const bTime = new Date(b.createdAt || 0).getTime();
    return sortKey === 'oldest' ? aTime - bTime : bTime - aTime;
  });
  return rows;
}
