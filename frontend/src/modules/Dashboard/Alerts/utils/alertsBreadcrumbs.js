/** Home → Alerts → current category */
export function buildAlertsHubCrumbs(categoryKey = 'all', categoryLabel = 'All Alerts') {
  const crumbs = [
    { label: 'Home', to: '/dashboard' },
    { label: 'Alerts', to: '/notifications/alerts' },
  ];
  if (categoryKey && categoryKey !== 'all') {
    crumbs.push({ label: categoryLabel || categoryKey });
  } else {
    crumbs.push({ label: 'Alerts Hub' });
  }
  return crumbs;
}

export function buildEmployerAlertsHubCrumbs(categoryKey = 'all', categoryLabel = 'All Alerts') {
  const crumbs = [
    { label: 'Company', to: '/company/dashboard' },
    { label: 'Notifications', to: '/company/notifications' },
  ];
  if (categoryKey && categoryKey !== 'all') {
    crumbs.push({ label: categoryLabel || categoryKey });
  } else {
    crumbs.push({ label: 'Alerts Hub' });
  }
  return crumbs;
}
