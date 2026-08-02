export const CONVERSATION_LABELS = [
  { id: 'hiring', label: 'Hiring' },
  { id: 'interview', label: 'Interview' },
  { id: 'support', label: 'Support' },
  { id: 'vip', label: 'VIP' },
  { id: 'urgent', label: 'Urgent' },
  { id: 'payment', label: 'Payment' },
  { id: 'verified', label: 'Verified' },
];

export const HIRING_STAGE_FILTERS = [
  { id: '', label: 'Any stage' },
  { id: 'applied', label: 'Applied' },
  { id: 'reviewing', label: 'Reviewing' },
  { id: 'shortlisted', label: 'Shortlisted' },
  { id: 'interview_scheduled', label: 'Interview' },
  { id: 'technical_test', label: 'Technical Test' },
  { id: 'offer_sent', label: 'Offer Sent' },
  { id: 'hired', label: 'Hired' },
  { id: 'rejected', label: 'Rejected' },
];

export function deliveryLabel(status) {
  const key = String(status || 'sent').toLowerCase();
  if (key === 'failed') return 'Failed';
  if (key === 'read' || key === 'seen') return 'Seen';
  if (key === 'delivered') return 'Delivered';
  if (key === 'sending') return 'Sending';
  return 'Sent';
}

/** WhatsApp-style ticks: fail / sent / delivered / read */
export function deliveryTicks(status) {
  const key = String(status || 'sent').toLowerCase();
  if (key === 'failed') return '⚠';
  if (key === 'read' || key === 'seen') return '✓✓';
  if (key === 'delivered') return '✓✓';
  if (key === 'sending') return '…';
  return '✓';
}
