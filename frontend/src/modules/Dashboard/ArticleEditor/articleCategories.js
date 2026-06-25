import { PRIMARY_SERVICE_CATEGORIES } from '../../../data/serviceCatalog/primaryCategories';

/** Article-specific labels plus full platform service categories. */
const ARTICLE_ONLY_CATEGORIES = [
  'General',
  'SEO',
  'Growth Marketing',
  'Content Strategy',
  'Copywriting',
  'Technical Writing',
  'Case Study',
  'How-To Guide',
  'Listicle',
  'Opinion',
  'News & Updates',
  'Events & Weddings',
  'Career & Freelancing',
  'Productivity',
  'Leadership',
  'Startup',
  'Finance',
  'Health & Wellness',
  'Education',
];

const catalogNames = PRIMARY_SERVICE_CATEGORIES.map((row) => row.name);

export const ARTICLE_CATEGORIES = [...new Set([...ARTICLE_ONLY_CATEGORIES, ...catalogNames])].sort(
  (a, b) => a.localeCompare(b),
);

export const DEFAULT_ARTICLE_CATEGORY = 'General';
