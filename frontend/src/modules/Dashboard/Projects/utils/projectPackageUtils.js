const LABELS = { basic: 'Basic', standard: 'Standard', premium: 'Premium' };

export function packageSelectLabel(packageKey) {
  const name = LABELS[packageKey] || 'Standard';
  return `Submit ${name} Proposal`;
}

export function buildPackageSelectionPayload(packageKey, tier, userPayload) {
  return {
    ...userPayload,
    package_key: packageKey,
    package_label: tier?.label || LABELS[packageKey] || 'Standard',
    price: Number(tier?.price) || 0,
    delivery_days: Number(tier?.delivery || tier?.deliveryDays) || 30,
    revisions: Number(tier?.revisions) || 2,
  };
}

export function getContributorPackageKey(contributors, userId) {
  if (!userId) return null;
  const row = (contributors || []).find((c) => String(c.user_id) === String(userId));
  if (!row) return null;
  return row.selected_package?.key || row.package_key || null;
}
