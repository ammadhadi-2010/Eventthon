import { PROJECTS_MENU } from '../data/projectsHubData';

const SECTION_LABELS = Object.fromEntries(PROJECTS_MENU.map((item) => [item.id, item.label]));
SECTION_LABELS['create-project'] = 'Create Project';
SECTION_LABELS.activity = 'Activity';
SECTION_LABELS['top-collaborators'] = 'Top Collaborators';

export function projectsSectionLabel(sectionId = 'overview') {
  return SECTION_LABELS[sectionId] || 'Projects';
}

/** Home → Projects → current hub section */
export function buildProjectsHubCrumbs(sectionId = 'overview') {
  const crumbs = [
    { label: 'Home', to: '/dashboard' },
    { label: 'Projects', to: '/projects' },
  ];
  const current = projectsSectionLabel(sectionId);
  if (sectionId === 'overview') {
    crumbs.push({ label: current });
    return crumbs;
  }
  crumbs.push({ label: current });
  return crumbs;
}
