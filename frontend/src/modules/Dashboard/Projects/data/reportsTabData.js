export const REPORTS_PROJECTS_KPIS = [
  { id: 'active', label: 'Active Projects', value: '12', delta: '+ 2 this month', trend: 'up' },
  { id: 'avg', label: 'Avg Completion', value: '68%', delta: '+ 5% vs last month', trend: 'up' },
  { id: 'risk', label: 'At Risk', value: '2', delta: 'Needs review', trend: 'down' },
  { id: 'track', label: 'On Track', value: '10', delta: '+ 3 this week', trend: 'up' },
];

export const REPORTS_PROJECTS_ROWS = [
  { id: 'rp1', name: 'AI Chatbot Platform', lead: 'Sarah Khan', progress: 75, status: 'in-progress', category: 'AI & ML' },
  { id: 'rp2', name: 'EventThon Mobile App', lead: 'Usman Ali', progress: 60, status: 'in-progress', category: 'Mobile' },
  { id: 'rp3', name: 'SEO Analytics Dashboard', lead: 'Bilal Ahmed', progress: 90, status: 'in-review', category: 'Web Dev' },
  { id: 'rp4', name: 'ET Coin Wallet', lead: 'Ayesha Malik', progress: 30, status: 'in-review', category: 'Blockchain' },
  { id: 'rp5', name: 'Marketing Campaign', lead: 'Hira Saeed', progress: 35, status: 'on-hold', category: 'Marketing' },
  { id: 'rp6', name: 'Squad Portal Redesign', lead: 'Sarah Khan', progress: 100, status: 'completed', category: 'Design' },
];

export const REPORTS_CATEGORY_BARS = [
  { label: 'AI & ML', value: 98, pct: 85 },
  { label: 'Web Dev', value: 248, pct: 72 },
  { label: 'Mobile', value: 132, pct: 64 },
  { label: 'Blockchain', value: 64, pct: 58 },
];

export const REPORTS_TEAM_KPIS = [
  { id: 'members', label: 'Team Members', value: '18', delta: '+ 2 this month', trend: 'up' },
  { id: 'util', label: 'Avg Utilization', value: '78%', delta: '+ 4% this week', trend: 'up' },
  { id: 'done', label: 'Tasks Completed', value: '156', delta: '+ 24 this week', trend: 'up' },
  { id: 'open', label: 'Open Tasks', value: '42', delta: '- 8 this week', trend: 'up' },
];

export const REPORTS_TEAM_ROWS = [
  { id: 't1', name: 'Sarah Khan', role: 'Tech Lead', utilization: 92, tasks: 14, initials: 'SK' },
  { id: 't2', name: 'Usman Ali', role: 'Full Stack Dev', utilization: 85, tasks: 11, initials: 'UA' },
  { id: 't3', name: 'Hira Saeed', role: 'UI/UX Designer', utilization: 76, tasks: 9, initials: 'HS' },
  { id: 't4', name: 'Bilal Ahmed', role: 'Backend Dev', utilization: 88, tasks: 12, initials: 'BA' },
  { id: 't5', name: 'Ayesha Malik', role: 'Product Manager', utilization: 70, tasks: 8, initials: 'AM' },
];

export const REPORTS_TEAM_LOAD = [
  { day: 'Mon', value: 32 },
  { day: 'Tue', value: 38 },
  { day: 'Wed', value: 42 },
  { day: 'Thu', value: 45 },
  { day: 'Fri', value: 40 },
  { day: 'Sat', value: 18 },
  { day: 'Sun', value: 12 },
];

export const REPORTS_FINANCIALS_KPIS = [
  { id: 'budget', label: 'Total Budget', value: '$48.6K', delta: '+ 12% allocated', trend: 'up' },
  { id: 'spent', label: 'Total Spent', value: '$32.4K', delta: '67% of budget', trend: 'up' },
  { id: 'left', label: 'Remaining', value: '$16.2K', delta: '33% available', trend: 'up' },
  { id: 'burn', label: 'Burn Rate', value: '12%', delta: 'Per week avg', trend: 'down' },
];

export const REPORTS_FINANCIALS_MONTHLY = [
  { month: 'Jan', budget: 40, spent: 28 },
  { month: 'Feb', budget: 42, spent: 30 },
  { month: 'Mar', budget: 45, spent: 35 },
  { month: 'Apr', budget: 48, spent: 38 },
  { month: 'May', budget: 50, spent: 42 },
  { month: 'Jun', budget: 52, spent: 44 },
];

export const REPORTS_FINANCIALS_ROWS = [
  { id: 'f1', project: 'AI Chatbot Platform', budget: '$12,500', spent: '$9,200', remaining: '$3,300' },
  { id: 'f2', project: 'EventThon Mobile App', budget: '$22,000', spent: '$14,800', remaining: '$7,200' },
  { id: 'f3', project: 'ET Coin Wallet', budget: '$15,800', spent: '$11,400', remaining: '$4,400' },
  { id: 'f4', project: 'Marketing Campaign', budget: '$4,200', spent: '$2,100', remaining: '$2,100' },
];
