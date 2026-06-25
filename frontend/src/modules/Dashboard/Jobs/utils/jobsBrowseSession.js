const KEY = 'eventthon:jobsBrowseFilters:v1';

export const EMPTY_JOBS_FILTERS = {
  q: '',
  category: '',
  experienceLevel: '',
  jobType: '',
  location: '',
  workMode: '',
  salaryMin: null,
  salaryMax: null,
};

function safeParse(raw) {
  try {
    const o = JSON.parse(raw);
    return o && typeof o === 'object' ? o : null;
  } catch {
    return null;
  }
}

export function loadJobsBrowseFilters() {
  if (typeof window === 'undefined') return { ...EMPTY_JOBS_FILTERS };
  return { ...EMPTY_JOBS_FILTERS, ...(safeParse(window.sessionStorage.getItem(KEY)) || {}) };
}

export function saveJobsBrowseFilters(patch) {
  if (typeof window === 'undefined') return { ...EMPTY_JOBS_FILTERS };
  const next = { ...loadJobsBrowseFilters(), ...(patch || {}) };
  window.sessionStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
