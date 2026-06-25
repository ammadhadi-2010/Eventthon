export const FEEDBACK_TYPE_LABELS = {
  bug: 'Bug',
  feature_request: 'Feature request',
  abuse: 'Abuse',
  payment: 'Payment',
  other: 'Other',
  design: 'Design Issue',
  feature: 'New Feature Idea',
};

export const STATUS_OPTIONS = ['New', 'In Progress', 'Resolved', 'Closed'];
export const PRIORITY_OPTIONS = ['High', 'Medium', 'Low'];

export function feedbackTypeLabel(type) {
  return FEEDBACK_TYPE_LABELS[String(type || '').toLowerCase()] || 'Bug';
}

export function formatFeedbackDate(value) {
  if (!value) return 'Recently';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatRelativeTime(value) {
  if (!value) return 'Just now';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Just now';
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

export function statusClassName(status) {
  return `abr-pill abr-pill--${String(status || 'New').toLowerCase().replace(/\s+/g, '-')}`;
}

export function priorityClassName(priority) {
  return `abr-priority abr-priority--${String(priority || 'Medium').toLowerCase()}`;
}
