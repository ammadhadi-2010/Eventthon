export const SQUAD_FEATURE_CARDS = [
  { title: 'Collaboration', subtitle: 'Work together on SEO projects', status: 'Active', tone: 'green' },
  { title: 'Knowledge Share', subtitle: 'Learn from expert members', status: 'Active', tone: 'green' },
  { title: 'Global Members', subtitle: 'Connect worldwide', status: 'Active', tone: 'green' },
  { title: 'Premium Squad', subtitle: 'Exclusive resources & tools', status: 'Pro Level', tone: 'gold' },
];

export const DEFAULT_DISCUSSIONS = [
  { id: 'd1', title: 'Best SEO Tools for 2025', author: 'Sarah Khan', comments: 24 },
  { id: 'd2', title: 'Google Algorithm Update Discussion', author: 'Usman Ali', comments: 18 },
  { id: 'd3', title: 'Content Strategy Tips', author: 'Hira Saeed', comments: 31 },
];

export const SQUAD_GOALS = [
  'Complete 10 Projects',
  'Reach 50 Members',
  'Maintain 90% Activity',
];

export const QUICK_ACTIONS = [
  { label: 'Invite Members', tab: null, action: 'invite' },
  { label: 'Create Project', tab: 'Projects', action: 'project' },
  { label: 'Start Discussion', tab: 'Chat', action: 'chat' },
  { label: 'Upload File', tab: 'Files', action: 'upload' },
  { label: 'Squad Settings', tab: 'Settings', action: 'settings' },
];

export function projectProgress(project) {
  if (typeof project.progress === 'number') return Math.min(100, project.progress);
  const s = String(project.status || '').toLowerCase();
  if (s.includes('complete')) return 100;
  if (s.includes('hold')) return 40;
  if (s.includes('plan')) return 25;
  return 65;
}

export function formatSquadDate(raw) {
  if (!raw) return 'Recently';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return 'Recently';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function memberAvatar(name, seed) {
  return `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(seed || name || 'member')}`;
}
