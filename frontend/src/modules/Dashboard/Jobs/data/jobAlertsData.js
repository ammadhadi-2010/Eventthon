export function formatAlertMeta(alert) {
  return [alert.salary, alert.workMode, alert.experience].filter(Boolean).join(' · ');
}

export function normalizeAlertKind(alert) {
  return String(alert?.alertKind || 'job').toLowerCase() === 'opportunity'
    ? 'opportunity'
    : 'job';
}
