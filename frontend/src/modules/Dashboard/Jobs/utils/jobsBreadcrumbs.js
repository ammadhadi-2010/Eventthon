import { jobMenu } from '../data/jobsMenuData';
import { resolveJobWizardMode } from '../createJobAlert/jobWizardModes';

const SECTION_LABELS = Object.fromEntries(jobMenu.map((item) => [item.id, item.label]));

SECTION_LABELS.browse = 'Browse Jobs';
SECTION_LABELS.opportunities = 'Browse Opportunities';

export function jobsSectionLabel(sectionId) {
  return SECTION_LABELS[sectionId] || 'Jobs';
}

/** Home → Jobs → current hub section */
export function buildJobsHubCrumbs(sectionId = 'browse') {
  const crumbs = [
    { label: 'Home', to: '/dashboard' },
    { label: 'Jobs', to: '/jobs' },
  ];
  const current = jobsSectionLabel(sectionId);
  if (sectionId === 'browse') {
    crumbs.push({ label: current });
    return crumbs;
  }
  crumbs.push({ label: current });
  return crumbs;
}

/** Home → Jobs → … → wizard page */
export function buildJobsWizardCrumbs(mode = 'alert') {
  const meta = resolveJobWizardMode(mode);
  const crumbs = [
    { label: 'Home', to: '/dashboard' },
    { label: 'Jobs', to: '/jobs' },
  ];

  if (mode === 'alert' || mode === 'opportunityAlert') {
    crumbs.push({ label: 'Job Alerts', to: '/jobs/alerts' });
  } else if (mode === 'company') {
    crumbs.push({ label: 'Company Hub', to: meta.backPath || '/company/dashboard/jobs' });
  }

  crumbs.push({ label: meta.title });
  return crumbs;
}
