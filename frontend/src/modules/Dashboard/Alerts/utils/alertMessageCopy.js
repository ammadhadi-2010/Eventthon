const RAW_MESSAGE_REWRITES = [
  {
    pattern: /thanks\s*a\s*lot\s*mery\s*disign/i,
    replacement: 'Thank you for helping us improve our system design.',
  },
  {
    pattern: /thanks\s*a\s*lot/i,
    replacement: 'Thank you for helping us improve our system design.',
  },
];

export function sanitizeAlertCopy(text, fallback = '') {
  const raw = String(text || '').trim();
  if (!raw) return fallback;

  for (const rule of RAW_MESSAGE_REWRITES) {
    if (rule.pattern.test(raw)) {
      return rule.replacement;
    }
  }

  return raw;
}

export function formatPriorityLabel(priority) {
  const value = String(priority || 'normal').trim().toLowerCase();
  if (!value) return 'Normal';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatReadLabel(isRead) {
  return isRead ? 'Read' : 'Unread';
}
