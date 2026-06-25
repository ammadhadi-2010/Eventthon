/** Consistent application status keys across Jobs hub views and API. */
export const APPLICATION_STATUS_KEYS = {
  ALL: 'all',
  APPLIED: 'applied',
  IN_REVIEW: 'in-review',
  INTERVIEW: 'interview',
  OFFERED: 'offered',
};

export const APPLICATION_TABS = [
  { id: APPLICATION_STATUS_KEYS.ALL, label: 'All' },
  { id: APPLICATION_STATUS_KEYS.APPLIED, label: 'Applied' },
  { id: APPLICATION_STATUS_KEYS.IN_REVIEW, label: 'In Review' },
  { id: APPLICATION_STATUS_KEYS.INTERVIEW, label: 'Interview' },
  { id: APPLICATION_STATUS_KEYS.OFFERED, label: 'Offered' },
];

export const APPLICATION_STATUS_LABELS = {
  applied: 'Applied',
  'in-review': 'In Review',
  interview: 'Interview',
  offered: 'Offered',
};

export const APPLICATION_STATUS_TONES = {
  applied: 'applied',
  'in-review': 'review',
  interview: 'interview',
  offered: 'offered',
};

export function statusMeta(status) {
  const key = status || 'applied';
  return {
    label: APPLICATION_STATUS_LABELS[key] || key,
    tone: APPLICATION_STATUS_TONES[key] || 'applied',
  };
}

export const RECRUITER_ACTIONS = [
  { id: 'in-review', label: 'Move to In Review' },
  { id: 'interview', label: 'Schedule Interview' },
  { id: 'offered', label: 'Send Offer' },
];

export function tabCounts(applications) {
  const list = Array.isArray(applications) ? applications : [];
  return APPLICATION_TABS.map((tab) => ({
    ...tab,
    count:
      tab.id === APPLICATION_STATUS_KEYS.ALL
        ? list.length
        : list.filter((row) => row.status === tab.id).length,
  }));
}
