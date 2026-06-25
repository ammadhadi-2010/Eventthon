import {
  JOBS_EXPERIENCE_OPTIONS,
  JOBS_LOCATION_OPTIONS,
  JOBS_SALARY_OPTIONS,
  JOBS_TYPE_OPTIONS,
  buildJobsCategoryFilterOptions,
} from '../../Gigs/components/filters/filterVariants';

export const JOB_ALERT_STEPS = [
  { id: 1, label: 'Job Details' },
  { id: 2, label: 'Skills & Keywords' },
  { id: 3, label: 'Location & Type' },
  { id: 4, label: 'Preferences' },
  { id: 5, label: 'Notifications' },
  { id: 6, label: 'Job Preview' },
];

export const EMPLOYMENT_TYPES = JOBS_TYPE_OPTIONS.map(([label]) => label);
export const EXPERIENCE_LEVELS = JOBS_EXPERIENCE_OPTIONS.map(([label]) => label);
export const CAREER_LEVELS = ['Fresher', 'Entry Level', 'Mid Level', 'Senior Level', 'Lead / Principal'];
export const WORK_MODES = JOBS_LOCATION_OPTIONS.slice(0, 3).map(([label]) => label);

const _defaultCategories = buildJobsCategoryFilterOptions();
export const MATCH_FREQUENCIES = ['Instant', 'Daily', 'Weekly'];

export const SALARY_SLIDER = {
  min: JOBS_SALARY_OPTIONS[1]?.[1] || 60,
  max: JOBS_SALARY_OPTIONS[JOBS_SALARY_OPTIONS.length - 1]?.[2] || 200,
};

export const JOB_DESCRIPTION_PLACEHOLDER =
  'e.g., Looking for a Senior Frontend Developer to design scalable React components, manage design systems using Tailwind CSS, and collaborate with backend squads...';

export const DEFAULT_FORM = {
  jobTitle: '',
  jobDescription: '',
  employmentType: EMPLOYMENT_TYPES[0] || 'Full-time',
  experienceLevel: EXPERIENCE_LEVELS[0] || 'Fresher',
  careerLevel: CAREER_LEVELS[0] || 'Fresher',
  jobCategory: _defaultCategories[0]?.name || 'Web Development',
  salaryMin: SALARY_SLIDER.min,
  salaryMax: 100,
  skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Node.js'],
  keywords: ['Remote', 'Frontend'],
  keywordInput: '',
  skillInput: '',
  workMode: WORK_MODES[0] || 'Remote',
  location: '',
  timezone: 'Any',
  companySize: 'Any',
  matchStrictness: 'Balanced',
  emailNotifications: true,
  pushNotifications: true,
  weeklySummary: false,
  notificationEmail: '',
  alertFrequency: 'Instant',
};
