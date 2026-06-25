import { resolveDashboardMediaUrl } from '../utils/dashboardMedia';
import { themeForType } from './updateThemes';

const DEMO_UPDATES = [
  {
    id: 'demo-project',
    update_type: 'project',
    title: 'SEO Dashboard 80% Completed',
    message: 'Project milestone reached in your active workspace.',
    imageurl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'demo-gig',
    update_type: 'gig',
    title: 'New SEO Audit Gig Published',
    message: 'A fresh gig is now live in the marketplace.',
    imageurl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'demo-achievement',
    update_type: 'achievement',
    title: 'Top Rated Plus Badge Earned',
    message: 'Your profile quality score unlocked a new badge.',
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'demo-squad',
    update_type: 'squad',
    title: 'SEO Masters Reached 100 Members',
    message: 'Your squad crossed a new growth milestone.',
    imageurl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'demo-job',
    update_type: 'job',
    title: 'Hiring React Developer for Remote',
    message: 'A new remote job opening matches your network.',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
];

export function formatUpdateTime(iso) {
  if (!iso) return 'Just now';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Just now';
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}

export function mapUpdateRow(row) {
  const type = row.update_type || 'article';
  const theme = themeForType(type);
  return {
    id: row.id || row._id,
    type,
    theme,
    title: row.title || 'Platform update',
    message: row.message || '',
    imageurl: resolveDashboardMediaUrl(row.imageurl || ''),
    timeAgo: formatUpdateTime(row.created_at),
    actionUrl: row.action_url || '',
  };
}

export function buildUpdatesList(apiRows = []) {
  const source = apiRows.length ? apiRows : DEMO_UPDATES;
  const mapped = source.map(mapUpdateRow);
  const seen = new Set();
  return mapped.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}
