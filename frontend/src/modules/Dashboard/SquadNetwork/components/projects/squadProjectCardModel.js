import { resolveProjectContributors } from '../../../Projects/utils/projectContributors';

const TECH_GLOW = {
  react: '#38bdf8',
  'node.js': '#34d399',
  node: '#34d399',
  python: '#fbbf24',
  fastapi: '#10b981',
  mongo: '#4ade80',
  mongodb: '#4ade80',
  postgresql: '#93c5fd',
  typescript: '#60a5fa',
  vue: '#4ade80',
};

export function techBadgeTone(name) {
  const key = String(name || '').toLowerCase();
  return TECH_GLOW[key] || '#a78bfa';
}

export function normalizeStatus(status) {
  const value = String(status || '').toLowerCase();
  if (value.includes('hold')) return 'on hold';
  if (value.includes('complete')) return 'completed';
  if (value.includes('plan')) return 'planning';
  if (value.includes('progress') || value === 'active') return 'in progress';
  return 'in progress';
}

export function statusLabel(statusKey) {
  const map = {
    'in progress': 'In Progress',
    completed: 'Completed',
    'on hold': 'On Hold',
    planning: 'Planning',
  };
  return map[statusKey] || 'In Progress';
}

export function getProgressValue(project) {
  if (typeof project.progress === 'number') return clamp(project.progress);
  const status = normalizeStatus(project.status);
  if (status === 'completed') return 100;
  if (status === 'on hold') return 40;
  if (status === 'planning') return 25;
  return 65;
}

function clamp(num) {
  return Math.max(0, Math.min(100, Math.round(num)));
}

function collectTechStack(project) {
  const parts = [
    ...(Array.isArray(project.tech_stack) ? project.tech_stack : []),
    ...(Array.isArray(project.techStack) ? project.techStack : []),
    ...(Array.isArray(project.tags) ? project.tags : []),
  ];
  const seen = new Set();
  const out = [];
  parts.forEach((item) => {
    const label = String(item || '').trim();
    if (!label) return;
    const key = label.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push(label);
  });
  return out.length ? out.slice(0, 8) : ['General'];
}

function countContributors(project, contributorList) {
  if (contributorList?.length) return contributorList.length;
  if (typeof project.contributors_count === 'number') return project.contributors_count;
  if (typeof project.contributorsCount === 'number') return project.contributorsCount;
  return project.owner ? 1 : 0;
}

function formatUsdAmount(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return null;
  return num.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

export function formatBudgetSegment(project) {
  const min = project?.budget_min ?? project?.budgetMin;
  const max = project?.budget_max ?? project?.budgetMax;
  const minLabel = formatUsdAmount(min);
  const maxLabel = formatUsdAmount(max);
  if (minLabel && maxLabel) return `${minLabel}-${maxLabel}`;
  if (minLabel) return `${minLabel}+`;
  if (maxLabel) return `up to ${maxLabel}`;
  const range = project?.budget_range || project?.budgetRange || project?.budget;
  if (range) {
    const cleaned = String(range).replace(/^\$/, '').trim();
    return cleaned || 'Not set';
  }
  return 'Not set';
}

export function formatTimelineSegment(project) {
  return (
    project?.timeline ||
    project?.due_date ||
    project?.deadline ||
    project?.duration ||
    'TBD'
  );
}

export function buildBudgetTimelineLine(project) {
  return `Budget: ${formatBudgetSegment(project)} USD | Timeline: ${formatTimelineSegment(project)}`;
}

export function normalizeSquadProjectCard(project, index = 0) {
  const contributorList = resolveProjectContributors(project || {});
  const statusKey = normalizeStatus(project?.status);
  const progress = getProgressValue(project || {});
  const tasksTotal =
    project?.tasks_total ?? project?.tasksTotal ?? Math.max(8, collectTechStack(project).length * 3);
  let tasksCompleted = project?.tasks_completed ?? project?.tasksCompleted;
  if (tasksCompleted == null) {
    tasksCompleted = Math.round((progress / 100) * tasksTotal);
  }

  const description =
    project?.description ||
    project?.short_description ||
    project?.shortDescription ||
    project?.summary ||
    'Project summary will appear here once details are added from the creation wizard.';

  return {
    id: project?.id || `project-${index}`,
    title: project?.title || 'Untitled Project',
    description: String(description).replace(/<[^>]+>/g, '').slice(0, 220),
    statusKey,
    statusLabel: statusLabel(statusKey),
    progress,
    techStack: collectTechStack(project || {}),
    tasksCompleted: Math.min(tasksCompleted, tasksTotal),
    tasksTotal,
    contributors: countContributors(project || {}, contributorList),
    contributorList,
    showroomViews: project?.showroom_views ?? project?.showroomViews ?? progress * 12,
    liveUrl: project?.live_url || project?.liveUrl || '',
    githubUrl: project?.github_url || project?.githubUrl || '',
    budgetTimelineLine: buildBudgetTimelineLine(project || {}),
    raw: project,
  };
}
