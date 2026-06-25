export const PROJECTS_MENU = [
  { id: 'overview', label: 'Overview', count: null },
  { id: 'my-projects', label: 'My Projects', count: 8 },
  { id: 'collaborations', label: 'Collaborations', count: 12 },
  { id: 'templates', label: 'Templates', count: null },
  { id: 'explore', label: 'Explore Projects', count: null },
  { id: 'saved', label: 'Saved Projects', count: 15 },
  { id: 'funding', label: 'Funding', count: 4 },
  { id: 'milestones', label: 'Milestones', count: null },
  { id: 'reports', label: 'Reports', count: null },
  { id: 'reviews', label: 'Reviews', count: null },
  { id: 'settings', label: 'Settings', count: null },
];

export const PROJECT_CATEGORIES = [
  { id: 'web', label: 'Web Development', count: 248 },
  { id: 'mobile', label: 'Mobile Apps', count: 132 },
  { id: 'ai', label: 'AI & Machine Learning', count: 98 },
  { id: 'design', label: 'Design & Creative', count: 176 },
  { id: 'marketing', label: 'Marketing', count: 89 },
  { id: 'blockchain', label: 'Blockchain', count: 64 },
  { id: 'games', label: 'Game Development', count: 45 },
  { id: 'other', label: 'Other', count: 73 },
];

export const KPI_METRICS = [
  { id: 'total', label: 'Total Projects', value: '24', delta: '+20% this month', tone: 'violet', spark: 'M0 20 L8 18 L16 14 L24 12 L32 10 L40 8' },
  { id: 'progress', label: 'In Progress', value: '12', delta: '+4 this week', tone: 'blue', spark: 'M0 18 L10 16 L20 14 L30 10 L40 6' },
  { id: 'done', label: 'Completed', value: '8', delta: '+3 this week', tone: 'green', spark: 'M0 22 L12 18 L24 14 L36 10 L40 8' },
  { id: 'hold', label: 'On Hold', value: '4', delta: '-1 this week', tone: 'red', spark: 'M0 8 L10 10 L20 14 L30 18 L40 20' },
];

export const BUDGET_SUMMARY = { label: 'Total Budget', value: '$48.6K', delta: '+32% this month' };

export const FEATURED_PROJECTS = [
  {
    id: 'fp-chatbot',
    title: 'AI Chatbot Platform',
    description: 'Enterprise conversational AI with multi-channel deployment.',
    agency: 'Nova Labs',
    verified: true,
    badges: ['FEATURED'],
    progress: 75,
    budget: '$12,400',
    tasks: 18,
    team: ['Sarah', 'Usman', 'Hira'],
    tone: 'ai',
  },
  {
    id: 'fp-seo',
    title: 'SEO Analytics Dashboard',
    description: 'Real-time ranking insights and competitor tracking suite.',
    agency: 'RankForge',
    verified: true,
    badges: ['TRENDING'],
    progress: 90,
    budget: '$8,200',
    tasks: 12,
    team: ['Bilal', 'Ayesha'],
    tone: 'seo',
  },
  {
    id: 'fp-mobile',
    title: 'EventThon Mobile App',
    description: 'Cross-platform community app for squads and events.',
    agency: 'EventThon Core',
    verified: true,
    badges: ['HOT'],
    progress: 60,
    budget: '$22,000',
    tasks: 24,
    team: ['Sarah', 'Usman', 'Bilal', 'Hira'],
    tone: 'mobile',
  },
  {
    id: 'fp-wallet',
    title: 'ET Coin Wallet',
    description: 'Secure THON wallet with staking and squad rewards.',
    agency: 'EventThon Finance',
    verified: true,
    badges: ['FEATURED'],
    progress: 80,
    budget: '$15,800',
    tasks: 16,
    team: ['Usman', 'Ayesha'],
    tone: 'wallet',
  },
];

export const TABLE_TABS = [
  { id: 'all', label: 'All Projects', count: 8 },
  { id: 'in-progress', label: 'In Progress', count: 5 },
  { id: 'completed', label: 'Completed', count: 2 },
  { id: 'on-hold', label: 'On Hold', count: 1 },
];

export const MY_PROJECTS_ROWS = [
  { id: 'p1', name: 'AI Content Generator', category: 'AI & Machine Learning', status: 'in-progress', progress: 65, budget: '$6,500', team: ['SK', 'UA'], deadline: 'May 30, 2025', updated: '2h ago', iconTone: 'ai' },
  { id: 'p2', name: 'SEO Analytics Dashboard', category: 'Web Development', status: 'in-review', progress: 90, budget: '$8,200', team: ['BA', 'HM'], deadline: 'Jun 12, 2025', updated: '5h ago', iconTone: 'seo' },
  { id: 'p3', name: 'EventThon Mobile App', category: 'Mobile Apps', status: 'in-progress', progress: 60, budget: '$22,000', team: ['SK', 'UA', 'BA'], deadline: 'Jul 1, 2025', updated: '1d ago', iconTone: 'mobile' },
  { id: 'p4', name: 'ET Coin Wallet', category: 'Blockchain', status: 'in-progress', progress: 80, budget: '$15,800', team: ['UA', 'AM'], deadline: 'Jun 20, 2025', updated: '3h ago', iconTone: 'wallet' },
  { id: 'p5', name: 'Marketing Campaign Hub', category: 'Marketing', status: 'on-hold', progress: 35, budget: '$4,200', team: ['HM'], deadline: 'Aug 5, 2025', updated: '2d ago', iconTone: 'marketing' },
  { id: 'p6', name: 'Squad Portal Redesign', category: 'Design & Creative', status: 'completed', progress: 100, budget: '$9,600', team: ['SK', 'AM'], deadline: 'Apr 18, 2025', updated: '4d ago', iconTone: 'design' },
  { id: 'p7', name: 'Game Matchmaking API', category: 'Game Development', status: 'completed', progress: 100, budget: '$11,300', team: ['BA', 'UA'], deadline: 'Mar 30, 2025', updated: '1w ago', iconTone: 'games' },
  { id: 'p8', name: 'Freelancer CRM Lite', category: 'Web Development', status: 'on-hold', progress: 20, budget: '$3,800', team: ['SK'], deadline: 'Sep 10, 2025', updated: '6h ago', iconTone: 'web' },
];

export const PROJECT_ACTIVITY = [
  { id: 'a1', project: 'AI Chatbot Platform', action: 'Task completed', time: '2m ago', tone: '#22c55e' },
  { id: 'a2', project: 'SEO Analytics Dashboard', action: 'Milestone completed', time: '15m ago', tone: '#3b82f6' },
  { id: 'a3', project: 'EventThon Mobile App', action: 'New task assigned', time: '1h ago', tone: '#a855f7' },
  { id: 'a4', project: 'ET Coin Wallet', action: 'Code review completed', time: '2h ago', tone: '#06b6d4' },
  { id: 'a5', project: 'Marketing Campaign', action: 'Project created', time: '3h ago', tone: '#f59e0b' },
];

export const TOP_COLLABORATORS = [
  { id: 'c1', name: 'Sarah Khan', projects: 20, rating: 4.9 },
  { id: 'c2', name: 'Usman Ali', projects: 18, rating: 4.8 },
  { id: 'c3', name: 'Hira Saeed', projects: 15, rating: 4.7 },
  { id: 'c4', name: 'Bilal Ahmed', projects: 12, rating: 4.9 },
  { id: 'c5', name: 'Ayesha Malik', projects: 10, rating: 4.6 },
];

export const STATUS_LABELS = {
  'in-progress': 'In Progress',
  'in-review': 'In Review',
  completed: 'Completed',
  'on-hold': 'On Hold',
};
