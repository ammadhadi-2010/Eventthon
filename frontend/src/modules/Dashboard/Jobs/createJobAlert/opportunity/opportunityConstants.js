import { buildJobsCategoryFilterOptions } from '../../../Gigs/components/filters/filterVariants';
import { OPPORTUNITY_TYPES } from '../../data/opportunityTypes';

export { OPPORTUNITY_TYPES };

export const OPPORTUNITY_STEPS = [
  { id: 1, label: 'Basics' },
  { id: 2, label: 'Details' },
  { id: 3, label: 'Budget' },
  { id: 4, label: 'Timing' },
  { id: 5, label: 'Team' },
  { id: 6, label: 'Preview' },
];

export const BUDGET_MODELS = ['Fixed', 'Hourly', 'Unpaid', 'Equity', 'Negotiable'];

export const WORK_MODES = ['Remote', 'Onsite', 'Hybrid'];

export const DURATION_OPTIONS = [
  '1–3 days',
  '1 week',
  '2–4 weeks',
  '1–3 months',
  '3–6 months',
  'Ongoing',
];

export const EXPERIENCE_OPTIONS = [
  'Any',
  'Fresher',
  '1–3 Years',
  '3–5 Years',
  '5+ Years',
];

const _categories = buildJobsCategoryFilterOptions();

export const DEFAULT_OPPORTUNITY_FORM = {
  jobTitle: '',
  jobCategory: _categories[0]?.name || 'Web Development',
  opportunityType: OPPORTUNITY_TYPES[0],
  jobDescription: '',
  skills: [],
  skillInput: '',
  experienceLevel: 'Any',
  budgetModel: 'Negotiable',
  budgetAmount: '',
  equityShare: '',
  duration: DURATION_OPTIONS[0],
  workMode: 'Remote',
  deadline: '',
  peopleNeeded: 1,
  attachmentNames: [],
};

export const OPPORTUNITY_DESC_PLACEHOLDER =
  'e.g. Need a React developer for a 3-day landing page sprint. Share scope, deliverables, and how you will work together…';
