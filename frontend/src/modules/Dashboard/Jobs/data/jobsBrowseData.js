/** Browse Jobs center feed — static English mock data. */

export const JOBS_BROWSE_STATS = [
  { label: 'Active Jobs', value: '2,487', change: '+18% this week', tone: 'violet' },
  { label: 'New This Week', value: '324', change: '+12% this week', tone: 'blue' },
  { label: 'Companies Hiring', value: '1,892', change: '+16% this week', tone: 'green' },
  { label: 'Applications Sent', value: '4,521', change: '+10% this week', tone: 'amber' },
];

export const JOBS_FEED_TABS = [
  'Recommended',
  'Latest Jobs',
  'Most Popular',
  'Remote Jobs',
  'Top Companies',
];

export const JOBS_FEED_LISTINGS = [
  {
    id: 'j1',
    role: 'Senior Frontend Developer',
    company: 'Google',
    salary: '$120k - $160k',
    type: 'Full-time',
    location: 'Remote',
    posted: '2h ago',
    logoText: 'G',
    logoClass: 'google',
    tags: ['React', 'TypeScript', 'Tailwind CSS', 'Featured'],
    remote: true,
    popular: true,
    topCompany: true,
    priority: 5,
  },
  {
    id: 'j2',
    role: 'AI/ML Engineer',
    company: 'Microsoft',
    salary: '$130k - $180k',
    type: 'Full-time',
    location: 'Redmond, USA',
    posted: '4h ago',
    logoText: 'MS',
    logoClass: 'microsoft',
    tags: ['Python', 'TensorFlow', 'Azure'],
    remote: false,
    popular: true,
    topCompany: true,
    priority: 4,
  },
  {
    id: 'j3',
    role: 'Product Designer',
    company: 'Figma',
    salary: '$90k - $120k',
    type: 'Full-time',
    location: 'Remote',
    posted: '6h ago',
    logoText: 'F',
    logoClass: 'figma',
    tags: ['UI/UX', 'Figma', 'Design System'],
    remote: true,
    popular: false,
    topCompany: true,
    priority: 3,
  },
  {
    id: 'j4',
    role: 'Data Analyst',
    company: 'Spotify',
    salary: '$80k - $105k',
    type: 'Full-time',
    location: 'New York, USA',
    posted: '8h ago',
    logoText: 'S',
    logoClass: 'spotify',
    tags: ['SQL', 'Python', 'Analytics'],
    remote: false,
    popular: true,
    topCompany: false,
    priority: 2,
  },
  {
    id: 'j5',
    role: 'Senior Product Manager',
    company: 'Airbnb',
    salary: '$140k - $175k',
    type: 'Full-time',
    location: 'San Francisco, USA',
    posted: '12h ago',
    logoText: 'A',
    logoClass: 'airbnb',
    tags: ['Product', 'Strategy', 'Growth'],
    remote: true,
    popular: true,
    topCompany: true,
    priority: 1,
  },
];

function jobPriority(job) {
  return Number(job?.priority) || 0;
}

function recommendedScore(job) {
  return jobPriority(job) + (job?.popular ? 4 : 0) + (job?.topCompany ? 2 : 0);
}

export function filterJobsByTab(jobs, tab) {
  const list = Array.isArray(jobs) ? jobs : [];
  if (tab === 'Latest Jobs') {
    return [...list].sort((a, b) => jobPriority(b) - jobPriority(a));
  }
  if (tab === 'Most Popular') {
    return list.filter((j) => j.popular);
  }
  if (tab === 'Remote Jobs') {
    return list.filter((j) => j.remote || j.workMode === 'Remote');
  }
  if (tab === 'Top Companies') {
    return list.filter((j) => j.topCompany);
  }
  return [...list].sort((a, b) => recommendedScore(b) - recommendedScore(a));
}
