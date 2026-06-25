const KEY = 'eventthon:gigBrowseFilters:v1';

export const EMPTY_BROWSE_FILTERS = {
  search: '',
  category: '',
  seller_user_id: '',
  service_focus: '',
  budget_buckets: [],
  delivery_label: 'Any',
  seller_levels: [],
  sort_label: 'Best Match',
};

function safeParse(raw) {
  try {
    const o = JSON.parse(raw);
    if (!o || typeof o !== 'object') return null;
    return o;
  } catch {
    return null;
  }
}

export function loadBrowseFilters() {
  if (typeof window === 'undefined') return { ...EMPTY_BROWSE_FILTERS };
  const fromStore = safeParse(window.sessionStorage.getItem(KEY));
  return { ...EMPTY_BROWSE_FILTERS, ...(fromStore || {}) };
}

export function saveBrowseFilters(patch) {
  if (typeof window === 'undefined') return;
  const prev = loadBrowseFilters();
  const next = { ...prev, ...(patch || {}) };
  window.sessionStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
