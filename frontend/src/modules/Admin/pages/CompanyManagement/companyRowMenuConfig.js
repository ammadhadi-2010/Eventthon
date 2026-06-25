export function buildCompanyUtilityItems(row) {
  const items = [{ key: 'view', label: 'View profile & details', kind: 'nav' }];
  const email = row?.contactEmail || row?.email;
  const website = row?.website;
  const publicId = row?.publicId || row?.id;
  if (email) items.push({ key: 'copy_email', label: 'Copy email', kind: 'copy', value: email });
  if (website) items.push({ key: 'copy_website', label: 'Copy website', kind: 'copy', value: website });
  if (publicId) items.push({ key: 'copy_pid', label: 'Copy public ID', kind: 'copy', value: publicId });
  return items;
}

export const COMPANY_STATUS_ACTIONS = [
  { key: 'approve', label: 'Approve / Verify', action: 'approve' },
  { key: 'reject', label: 'Reject company', action: 'reject', danger: true },
  { key: 'delete', label: 'Delete company', action: 'delete', danger: true },
];

export function isCompanyPending(row) {
  return String(row?.status || '').toLowerCase() === 'pending';
}
