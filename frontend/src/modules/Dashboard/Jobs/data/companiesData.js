/** Industry filter labels for Top Companies — derived from live listings. */
export const ALL_INDUSTRIES_LABEL = 'All Industries';

export function buildCompanyIndustries(rows = []) {
  const set = new Set();
  (Array.isArray(rows) ? rows : []).forEach((row) => {
    const ind = String(row?.industry || '').trim();
    if (ind) set.add(ind);
  });
  return [ALL_INDUSTRIES_LABEL, ...Array.from(set).sort((a, b) => a.localeCompare(b))];
}
