/** Seed dashboard metrics for the company panel preview state. */

export const COMPANY_APPLICATION_METRICS = {
  total: 28,
  segments: [
    { key: 'pending', label: 'Pending', count: 12, percent: 43 },
    { key: 'reviewing', label: 'Reviewing', count: 8, percent: 29 },
    { key: 'shortlisted', label: 'Shortlisted', count: 5, percent: 18 },
    { key: 'rejected', label: 'Rejected', count: 3, percent: 10 },
  ],
};

export const COMPANY_RECENT_APPLICATIONS = [
  {
    id: 'seed-app-1',
    name: 'John Doe',
    position: 'Frontend Engineer',
    status: 'Pending',
    statusKey: 'pending',
    time: '2h ago',
    imageurl: '',
  },
  {
    id: 'seed-app-2',
    name: 'Sarah Ahmed',
    position: 'AI Developer',
    status: 'Reviewing',
    statusKey: 'reviewing',
    time: '5h ago',
    imageurl: '',
  },
  {
    id: 'seed-app-3',
    name: 'Michael Chen',
    position: 'Full Stack Developer',
    status: 'Shortlisted',
    statusKey: 'shortlisted',
    time: '1d ago',
    imageurl: '',
  },
  {
    id: 'seed-app-4',
    name: 'Elena Rodriguez',
    position: 'DevOps Engineer',
    status: 'Pending',
    statusKey: 'pending',
    time: '1d ago',
    imageurl: '',
  },
];

export const COMPANY_TOP_SKILLS = [
  { name: 'Python', percent: 45, tone: 'violet' },
  { name: 'React', percent: 35, tone: 'cyan' },
  { name: 'Node.js', percent: 20, tone: 'green' },
];
