/** Shared option sets when filter panels run in Jobs browse mode. */
import { GLOBAL_SERVICE_CATEGORIES, GLOBAL_SERVICE_CATEGORY_OPTIONS } from '../../../../../data/globalCategories';

export const JOBS_EXPERIENCE_OPTIONS = [
  ['Fresher', 'No prior experience', '1,248'],
  ['Entry Level', '0-2 years', '892'],
  ['Mid Level', '2-5 years', '1,432'],
  ['Senior Level', '5+ years', '1,106'],
  ['Lead / Principal', '8+ years', '324'],
];

export const JOBS_TYPE_OPTIONS = [
  ['Full-time', '2,106'],
  ['Part-time', '412'],
  ['Contract', '638'],
  ['Internship', '214'],
];

export const JOBS_LOCATION_OPTIONS = [
  ['Remote', '1,892'],
  ['Hybrid', '624'],
  ['On-site', '518'],
  ['United States', '1,104'],
  ['Europe', '486'],
];

export const JOBS_SALARY_OPTIONS = [
  ['Any salary', null, null],
  ['$60k – $100k', 60, 100],
  ['$100k – $140k', 100, 140],
  ['$140k – $200k', 140, 200],
];

/** Full platform category list (same as Gigs / profile catalog). */
export const JOBS_CATEGORY_NAMES = GLOBAL_SERVICE_CATEGORIES;

export function buildJobsCategoryFilterOptions() {
  return GLOBAL_SERVICE_CATEGORY_OPTIONS.map((item, index) => ({
    ...item,
    count: String(120 + index * 31),
  }));
}
