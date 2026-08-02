/** EventThon internal hiring only — not marketplace / client jobs. */

export const CAREERS_SUBTITLE =
  'Open roles on the EventThon team. These are EventThon’s own hiring positions — not client gigs or marketplace jobs.';

export const DEPARTMENTS = ['All', 'Engineering', 'Design', 'Product'];

export const JOBS = [
  {
    id: 'frontend-engineer',
    title: 'Frontend Engineer @ EventThon',
    roleName: 'Frontend Engineer',
    dept: 'Engineering',
    location: 'Remote · Worldwide',
    type: 'Full-time',
    summary:
      'Build the EventThon web product — dashboards, hubs, and real-time collaboration UI with React.',
  },
  {
    id: 'backend-engineer',
    title: 'Backend Engineer @ EventThon',
    roleName: 'Backend Engineer',
    dept: 'Engineering',
    location: 'Remote · Worldwide',
    type: 'Full-time',
    summary:
      'Design APIs, services, and data systems that power EventThon’s squads, gigs, and platform core.',
  },
  {
    id: 'uiux-designer',
    title: 'UI/UX Designer @ EventThon',
    roleName: 'UI/UX Designer',
    dept: 'Design',
    location: 'Remote · Worldwide',
    type: 'Full-time',
    summary:
      'Shape EventThon’s product experience — flows, systems, and visual craft across member and company hubs.',
  },
];

export const CAREERS_APPLY_EMAIL = 'careers@eventthon.com';

/** Ensure display title always reads as an EventThon company role. */
export function formatEventThonJobTitle(rawTitle = '') {
  const title = String(rawTitle || '').trim();
  if (!title) return 'Open Role @ EventThon';
  if (/@\s*eventthon/i.test(title)) return title.replace(/@\s*eventthon/i, '@ EventThon');
  return `${title} @ EventThon`;
}
