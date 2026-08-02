/** Home → Gigs → current hub section */
export function buildGigsHubCrumbs(sectionId = 'Browse Gigs') {
  const crumbs = [
    { label: 'Home', to: '/dashboard' },
    { label: 'Gigs', to: '/gigs' },
  ];
  const current = sectionId || 'Browse Gigs';
  crumbs.push({ label: current });
  return crumbs;
}
