/** Seed dashboard blocks when live company data is empty. */

export const COMPANY_APPLICATION_METRICS = {
  total: 342,
  segments: [
    { key: 'pending', label: 'Pending', count: 120, percent: 35.1 },
    { key: 'reviewing', label: 'Reviewed', count: 98, percent: 28.7 },
    { key: 'shortlisted', label: 'Shortlisted', count: 64, percent: 18.7 },
    { key: 'rejected', label: 'Rejected', count: 48, percent: 14 },
    { key: 'hired', label: 'Hired', count: 12, percent: 3.5 },
  ],
};

export const COMPANY_RECENT_APPLICATIONS = [
  {
    id: 'seed-app-1',
    name: 'Ali Hassan',
    role: 'Frontend Developer',
    position: 'Frontend Developer',
    appliedFor: 'Senior Frontend Developer',
    status: 'New',
    statusKey: 'pending',
    time: '2d ago',
    imageurl: '',
  },
  {
    id: 'seed-app-2',
    name: 'Sara Khan',
    role: 'Frontend Developer',
    position: 'Frontend Developer',
    appliedFor: 'Senior Frontend Developer',
    status: 'New',
    statusKey: 'pending',
    time: '2d ago',
    imageurl: '',
  },
  {
    id: 'seed-app-3',
    name: 'Usman Javed',
    role: 'Backend Developer',
    position: 'Backend Developer',
    appliedFor: 'Backend Developer',
    status: 'Reviewed',
    statusKey: 'reviewing',
    time: '3d ago',
    imageurl: '',
  },
  {
    id: 'seed-app-4',
    name: 'Hina Fatima',
    role: 'UI/UX Designer',
    position: 'UI/UX Designer',
    appliedFor: 'UI/UX Designer',
    status: 'Shortlisted',
    statusKey: 'shortlisted',
    time: '5d ago',
    imageurl: '',
  },
  {
    id: 'seed-app-5',
    name: 'Ahmed Raza',
    role: 'DevOps Engineer',
    position: 'DevOps Engineer',
    appliedFor: 'DevOps Engineer',
    status: 'Interview',
    statusKey: 'interview',
    time: '6d ago',
    imageurl: '',
  },
];

export const COMPANY_OPEN_JOBS_SEED = [
  {
    id: 'seed-job-1',
    title: 'Senior Frontend Developer',
    employmentType: 'Full-time',
    location: 'Remote',
    applicants: 47,
    posted: '2d ago',
    tags: ['Full-time', 'Remote'],
  },
  {
    id: 'seed-job-2',
    title: 'Backend Developer (Node.js)',
    employmentType: 'Full-time',
    location: 'Karachi, Pakistan',
    applicants: 31,
    posted: '3d ago',
    tags: ['Full-time', 'Karachi, Pakistan'],
  },
  {
    id: 'seed-job-3',
    title: 'UI/UX Designer',
    employmentType: 'Full-time',
    location: 'Hybrid',
    applicants: 22,
    posted: '5d ago',
    tags: ['Full-time', 'Hybrid'],
  },
  {
    id: 'seed-job-4',
    title: 'DevOps Engineer',
    employmentType: 'Full-time',
    location: 'Remote',
    applicants: 0,
    posted: '1w ago',
    tags: ['Full-time', 'Remote'],
  },
  {
    id: 'seed-job-5',
    title: 'Data Analyst',
    employmentType: 'Part-time',
    location: 'Remote',
    applicants: 18,
    posted: '2w ago',
    tags: ['Part-time', 'Remote'],
  },
];

export const COMPANY_ANALYTICS_SEED = {
  profileViews: 8432,
  jobViews: 5210,
  applications: 342,
  hires: 12,
  followersGrowth: 1256,
  deltas: {
    profileViews: '+18%',
    jobViews: '+9%',
    applications: '+28%',
    hires: '+3%',
    followersGrowth: '+86%',
  },
};

export const COMPANY_KPI_SEED = {
  employees: '24',
  openJobs: 18,
  totalApplications: 342,
  hired: 12,
  followers: '1,256',
  profileViews: 8432,
  rating: 4.8,
};

export const COMPANY_TOP_SKILLS = [
  { name: 'React', percent: 42, tone: 'violet' },
  { name: 'Python', percent: 28, tone: 'cyan' },
  { name: 'Node.js', percent: 18, tone: 'green' },
  { name: 'Figma', percent: 12, tone: 'violet' },
];
