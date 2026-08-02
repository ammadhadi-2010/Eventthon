export const SQUAD_FEATURE_CARDS = [
  { title: 'Collaboration', subtitle: 'Ship projects together as a unit', status: 'Active', tone: 'green' },
  { title: 'Knowledge Share', subtitle: 'Learn from expert members', status: 'Active', tone: 'green' },
  { title: 'Global Members', subtitle: 'Connect worldwide', status: 'Active', tone: 'green' },
  { title: 'Premium Squad', subtitle: 'Exclusive resources & tools', status: 'Pro Level', tone: 'gold' },
];

export const DEFAULT_DISCUSSIONS = [
  { id: 'd1', title: 'Best SEO Tools for 2025', author: 'Sarah Khan', comments: 24 },
  { id: 'd2', title: 'Google Algorithm Update Discussion', author: 'Usman Ali', comments: 18 },
  { id: 'd3', title: 'Content Strategy Tips', author: 'Hira Saeed', comments: 31 },
];

export const DEFAULT_CLIENT_REVIEWS = [
  {
    id: 'r1',
    name: 'Sarah Chen',
    rating: 5,
    stars: 5,
    text: 'Outstanding AI integration work. Delivered ahead of schedule!',
    avatarSeed: 'Sarah Chen',
    avatar: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Sarah%20Chen',
  },
  {
    id: 'r2',
    name: 'Marcus Webb',
    rating: 5,
    stars: 5,
    text: 'Professional team, clear communication, great results.',
    avatarSeed: 'Marcus Webb',
    avatar: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Marcus%20Webb',
  },
  {
    id: 'r3',
    name: 'Priya Nair',
    rating: 4,
    stars: 4,
    text: 'Strong technical depth. Would hire again for ML projects.',
    avatarSeed: 'Priya Nair',
    avatar: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Priya%20Nair',
  },
];

export const DEFAULT_PORTFOLIO = [
  {
    id: 'p1',
    title: 'AI Chatbot Platform',
    image:
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=240&fit=crop',
    demoUrl: '#',
  },
  {
    id: 'p2',
    title: 'E-commerce Dashboard',
    image:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=240&fit=crop',
    demoUrl: '#',
  },
  {
    id: 'p3',
    title: 'Vision Analytics Suite',
    image:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=240&fit=crop',
    demoUrl: '#',
  },
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
