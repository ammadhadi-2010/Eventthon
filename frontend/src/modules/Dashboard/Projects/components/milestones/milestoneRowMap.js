const UNNAMED_MILESTONE = 'Unnamed Milestone';
const UNKNOWN_PROJECT = 'Unknown Project';

export function resolveMilestoneLabel(item = {}) {
  const label =
    item.milestone
    || item.title
    || item.name
    || item.milestoneName
    || item.label;
  return String(label || '').trim() || UNNAMED_MILESTONE;
}

export function resolveProjectLabel(item = {}) {
  const label =
    item.project
    || item.projectName
    || item.projectTitle
    || item.project_label
    || item.project_name;
  return String(label || '').trim() || UNKNOWN_PROJECT;
}

export function normalizeMilestoneRow(raw = {}) {
  return {
    ...raw,
    id: raw.id || raw._id || `${raw.projectId || 'project'}-milestone`,
    milestone: resolveMilestoneLabel(raw),
    project: resolveProjectLabel(raw),
    projectId: raw.projectId || raw.project_id || '',
    dueDate: raw.dueDate || raw.due_date || raw.deadline || '—',
    status: raw.status || 'pending',
    progress: Number(raw.progress ?? 0),
    accent: raw.accent || 'slate',
  };
}
