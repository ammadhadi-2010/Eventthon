export const ACHIEVEMENT_METRICS = [
  { key: 'milestone', label: 'Major Milestone' },
  { key: 'personal_best', label: 'Personal Best' },
  { key: 'certification', label: 'New Certification' },
  { key: 'revenue_goal', label: 'Revenue Goal' },
];

export function createEmptyMetaByType() {
  return {
    POST: {},
    SQUAD: { attach_to_squad: false, squad_id: '' },
    PROJECT: { progress_percent: 0 },
    WIN: { achievement_metric: 'milestone' },
  };
}

export function getActiveMeta(metaByType, postType) {
  return metaByType[postType] || {};
}
