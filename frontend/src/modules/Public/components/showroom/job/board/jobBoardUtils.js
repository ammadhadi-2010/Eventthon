export const JOB_BOARD_STATS = [
  { id: 'active', label: 'Active Jobs', value: '12.4K', delta: '+18.6% this week' },
  { id: 'companies', label: 'Companies Hiring', value: '1.8K', delta: '+21.3% this week' },
  { id: 'remote', label: 'Remote Jobs', value: '9.2K', delta: '+16.6% this week' },
  { id: 'salary', label: 'Avg. Salary', value: '$85K', delta: '+12.4% this week' },
];

export const JOB_FILTERS = [
  'Remote',
  'Hybrid',
  'Full-time',
  'Contract',
  'Worldwide',
  'Visa Sponsored',
  'More Filters',
];

export const FEATURED_COMPANIES = [
  { id: 'doist', name: 'Doist', color: '#6366f1' },
  { id: 'hubspot', name: 'HubSpot', color: '#f97316' },
  { id: 'vercel', name: 'Vercel', color: '#0f172a' },
];

const SKILL_SETS = [
  ['React', 'Next.js', 'TypeScript'],
  ['UI/UX', 'Figma', 'Design Systems'],
  ['Node.js', 'MongoDB', 'API'],
];

export function enrichJobLink(link, index) {
  const company = FEATURED_COMPANIES[index % FEATURED_COMPANIES.length];
  const salaryMatch = String(link.subtitle || '').match(/\$[\dKk\s\-–]+/);
  return {
    ...link,
    companyName: company.name,
    companyColor: company.color,
    postedAgo: ['2d ago', '4d ago', '1w ago'][index % 3],
    salary: salaryMatch ? salaryMatch[0] : '$120K - $160K',
    location: 'Fully Remote',
    employmentType: 'Full-time',
    skills: [...SKILL_SETS[index % SKILL_SETS.length], 'Remote'],
  };
}

export const BOARD_TRUST_BADGES = [
  'Secure & Verified',
  'Global Opportunities',
  'Safe & Trusted',
  '24/7 Support',
];
