import { loadBrowseFilters } from './gigsBrowseSession';

/** Merge persisted session filters + React Router gigFilters (+ legacy keys). */
export function mergeBrowseFromLocation(locationLike) {
  const st = locationLike?.state || {};
  const gf = typeof st.gigFilters === 'object' && st.gigFilters !== null ? st.gigFilters : {};
  let merged = { ...loadBrowseFilters(), ...gf };
  const legacyQ = typeof st.searchQuery === 'string' ? st.searchQuery.trim() : '';
  const legacyC = typeof st.searchCategory === 'string' ? st.searchCategory.trim() : '';
  if (legacyQ) merged = { ...merged, search: legacyQ };
  if (legacyC) merged = { ...merged, category: legacyC };
  return merged;
}

export function hasBrowseFiltersApplied(m = {}) {
  if (String(m.search || '').trim()) return true;
  if (String(m.category || '').trim()) return true;
  if (String(m.seller_user_id || '').trim()) return true;
  if (String(m.service_focus || '').trim()) return true;
  if (Array.isArray(m.budget_buckets) && m.budget_buckets.length > 0) return true;
  const dl = String(m.delivery_label || 'Any');
  if (dl !== 'Any' && dl !== 'Custom') return true;
  if (Array.isArray(m.seller_levels) && m.seller_levels.length === 1) {
    const t = m.seller_levels[0];
    if (t && t !== 'New Seller') return true;
  }
  if (typeof m.sort_label === 'string' && m.sort_label && m.sort_label !== 'Best Match') return true;
  return false;
}
