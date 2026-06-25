/** Primary CTA label and route for alert detail view. */

export function resolveAlertDetailAction(alert, employerMode = false) {
  if (!alert) {
    return { label: 'Back to Alerts', to: employerMode ? '/company/notifications' : '/notifications/alerts' };
  }

  const rawUrl = String(alert.action_url || '').trim();
  const to = rawUrl.startsWith('/') ? rawUrl : null;
  const category = String(alert.category || '').toLowerCase();
  const title = String(alert.title || '').toLowerCase();

  if (alert.action_label && to) {
    return { label: alert.action_label, to };
  }

  if (category === 'squad' || category === 'squads') {
    const manageMembers = title.includes('member joined') || title.includes('new member');
    return {
      label: manageMembers ? 'Manage Squad Members' : 'View Squad Workspace',
      to: to || '/squads',
    };
  }

  if (category === 'mentions') {
    return { label: 'Open Post', to: to || '/dashboard' };
  }

  if (category === 'security') {
    return { label: 'Review Security', to: to || '/profile/edit' };
  }

  if (category === 'projects') {
    return { label: 'Open Project', to: to || '/projects' };
  }

  if (category === 'jobs' || category === 'applications') {
    return { label: 'View Jobs', to: to || '/jobs' };
  }

  if (employerMode) {
    return { label: 'Open Company Hub', to: to || '/company/dashboard' };
  }

  return { label: alert.action_label || 'View Details', to: to || '/dashboard' };
}
