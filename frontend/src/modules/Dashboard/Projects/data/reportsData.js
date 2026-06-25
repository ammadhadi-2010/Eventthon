export const REPORTS_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'projects', label: 'Projects' },
  { id: 'team', label: 'Team' },
  { id: 'financials', label: 'Financials' },
];

export const REPORTS_SUMMARY = [
  { id: 'total', label: 'Total Projects', value: '24', delta: '+ 20% this month', trend: 'up' },
  { id: 'completed', label: 'Completed', value: '8', delta: '+ 3 this week', trend: 'up' },
  { id: 'in-progress', label: 'In Progress', value: '12', delta: '+ 4 this week', trend: 'up' },
  { id: 'on-hold', label: 'On Hold', value: '4', delta: '- 1 this week', trend: 'down' },
];

export const REPORTS_PROGRESS_SEGMENTS = [
  { id: 'completed', label: 'Completed', color: '#22c55e', pct: 33, count: 8 },
  { id: 'in-progress', label: 'In Progress', color: '#3b82f6', pct: 50, count: 12 },
  { id: 'on-hold', label: 'On Hold', color: '#ef4444', pct: 17, count: 4 },
];

export const ACTIVITY_WEEK = [
  { day: 'Mon', value: 28 },
  { day: 'Tue', value: 35 },
  { day: 'Wed', value: 32 },
  { day: 'Thu', value: 40 },
  { day: 'Fri', value: 38 },
  { day: 'Sat', value: 22 },
  { day: 'Sun', value: 30 },
];

export const ACTIVITY_MAX = 50;
