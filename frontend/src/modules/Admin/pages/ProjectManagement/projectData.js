import { CheckCircle2, FolderKanban, Layers, PauseCircle } from 'lucide-react';
import { API_BASE_URL } from '../../../../api/axiosConfig';

export const PROJECT_STATUS_FILTERS = ['All', 'In Progress', 'Completed', 'On Hold'];

export const STATUS_PILL_CLASS = {
  'In Progress': 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/25',
  Completed: 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/25',
  'On Hold': 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/25',
  Cancelled: 'bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/25',
};

export const PROGRESS_GRADIENT = {
  'In Progress': 'from-blue-500 to-blue-400',
  Completed: 'from-emerald-500 to-teal-400',
  'On Hold': 'from-amber-500 to-orange-400',
  Cancelled: 'from-rose-500 to-orange-400',
};

export const PROJECT_STAT_TEMPLATE = [
  { id: 'total', title: 'Total Projects', value: '0', percentage: '+0%', trend: 'up', colorTheme: 'violet', icon: Layers, sparklineData: [4, 6, 5, 8, 7, 9, 10] },
  { id: 'active', title: 'Active Projects', value: '0', percentage: '+0%', trend: 'up', colorTheme: 'blue', icon: FolderKanban, sparklineData: [3, 5, 4, 7, 6, 8, 9] },
  { id: 'completed', title: 'Completed Projects', value: '0', percentage: '+0%', trend: 'up', colorTheme: 'teal', icon: CheckCircle2, sparklineData: [2, 3, 4, 5, 6, 7, 8] },
  { id: 'onHold', title: 'On Hold Projects', value: '0', percentage: '+0%', trend: 'down', colorTheme: 'rose', icon: PauseCircle, sparklineData: [5, 4, 4, 3, 3, 2, 2] },
];

export const PROJECT_STATUS_OPTIONS = ['In Progress', 'Completed', 'On Hold'];

export function resolveProjectMediaUrl(path) {
  if (!path || typeof path !== 'string') return '';
  const trimmed = path.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http') || trimmed.startsWith('blob:') || trimmed.startsWith('data:')) return trimmed;
  return `${API_BASE_URL}${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}`;
}

export function teamAvatarUrl(member = {}) {
  const raw = String(member.imageurl || member.avatarUrl || '').trim();
  if (raw) return resolveProjectMediaUrl(raw) || raw;
  const seed = member.name || member.initials || 'member';
  return `https://api.dicebear.com/8.x/adventurer/svg?seed=${encodeURIComponent(seed)}`;
}

export function projectCoverUrl(row = {}) {
  const raw = String(row.imageurl || row.cover_preview || '').trim();
  if (raw) return resolveProjectMediaUrl(raw) || raw;
  return `https://api.dicebear.com/8.x/shapes/svg?seed=${encodeURIComponent(row.name || 'project')}`;
}

function parseBudgetNumbers(budgetLabel = '') {
  const nums = String(budgetLabel).replace(/[^0-9.]/g, ' ').trim().split(/\s+/).filter(Boolean);
  const values = nums.map((n) => Number(n)).filter((n) => !Number.isNaN(n));
  if (!values.length) return { total: 0, spent: 0 };
  const total = Math.max(...values);
  return { total, spent: Math.round(total * 0.72) };
}

export function mapProjectFromApi(item = {}) {
  const team = Array.isArray(item.team)
    ? item.team.map((member, index) => ({
        name: member.name || member.initials || `Member ${index + 1}`,
        initials: member.initials || (member.name || 'M').slice(0, 2).toUpperCase(),
        imageurl: resolveProjectMediaUrl(member.imageurl || ''),
      }))
    : [];
  return {
    id: String(item._id || item.id || ''),
    name: item.name || item.title || 'Untitled Project',
    category: item.category || 'General',
    team,
    extraTeam: Number(item.team_extra || 0),
    progress: Number(item.progress || 0),
    status: item.admin_status || item.status_label || 'In Progress',
    dueDate: item.due_date || item.deadline || '—',
    imageurl: item.imageurl || '',
    description: item.description || '',
    budgetLabel: item.budget || '',
    tasksCount: Number(item.tasks_count || 0),
  };
}

export function mapProjectDetailFromApi(item = {}) {
  const row = mapProjectFromApi(item);
  const pct = row.progress || 0;
  const remaining = Math.max(0, 100 - pct);
  const manager = item.manager || {};
  const budget = parseBudgetNumbers(row.budgetLabel);
  return {
    ...row,
    imageurl: projectCoverUrl(row),
    description: item.detailed_description || row.description || `${row.name} portfolio record.`,
    manager: {
      name: manager.name || row.name,
      imageurl: teamAvatarUrl({ name: manager.name, imageurl: manager.imageurl }),
    },
    priority: row.status === 'On Hold' ? 'Medium' : 'High',
    startDate: item.posted_on || row.dueDate,
    endDate: row.dueDate,
    budget,
    progressSlices: [
      { label: 'Completed', value: pct, color: '#14b8a6' },
      { label: 'Remaining', value: remaining, color: '#3b82f6' },
    ],
    tabCounts: { tasks: row.tasksCount || 8, team: row.team.length + row.extraTeam, files: 12 },
    keyFeatures: ['Milestone delivery', 'Stakeholder reviews', 'Quality assurance'],
    tasksSummary: {
      total: row.tasksCount || 8,
      completed: Math.round((row.tasksCount || 8) * (pct / 100)),
      inProgress: 2,
      pending: 1,
      overdue: 0,
    },
    timeline: [
      { label: 'Project Created', date: row.startDate?.slice(0, 6) || '—' },
      { label: 'Current Phase', date: row.dueDate?.slice(0, 6) || 'TBD' },
    ],
  };
}

export function buildStatCards(metrics = {}) {
  const total = metrics.totalProjects ?? 0;
  const active = metrics.activeProjects ?? 0;
  const completed = metrics.completedProjects ?? 0;
  const onHold = metrics.onHoldProjects ?? 0;
  const values = { total, active, completed, onHold };
  return PROJECT_STAT_TEMPLATE.map((card) => ({
    ...card,
    value: Number(values[card.id] ?? 0).toLocaleString(),
  }));
}
