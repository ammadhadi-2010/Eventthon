/** Shared opportunity labels — create wizard + left-sidebar browse. */
export const OPPORTUNITY_TYPES = [
  'Freelance Work',
  'One-time Task',
  'Short-term Project',
  'Need Team Member',
  'Need Co-Founder',
  'Need Investor',
  'Collaboration Request',
];

export function isOpportunityType(value) {
  return OPPORTUNITY_TYPES.includes(String(value || '').trim());
}
