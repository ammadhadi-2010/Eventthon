/**
 * Normalize Careers CMS payload so admin ↔ public /company/careers stay in sync.
 * Canonical field: jobTitle (bare role). title is mirrored for slug + list.
 */
export function bareEventThonRoleName(raw = '') {
  return String(raw || '')
    .replace(/\s*@\s*eventthon\s*$/i, '')
    .trim();
}

export function normalizeCareersFormPayload(formData = {}) {
  const role = bareEventThonRoleName(formData.jobTitle || formData.title);
  const location = String(formData.jobLocation || '').trim() || 'Remote · Worldwide';
  const department = String(formData.excerpt || '').trim() || 'Engineering';

  return {
    ...formData,
    category: 'Careers',
    jobTitle: role,
    title: role || 'Open Role',
    jobLocation: location,
    excerpt: department,
    content: String(formData.content || '').trim(),
    externalUrl: String(formData.externalUrl || '').trim(),
    sidebarOrder: Number(formData.sidebarOrder) || 0,
  };
}

export function careersListHeadline(row = {}) {
  const role = bareEventThonRoleName(row.jobTitle || row.title) || 'Open Role';
  return `${role} @ EventThon`;
}
