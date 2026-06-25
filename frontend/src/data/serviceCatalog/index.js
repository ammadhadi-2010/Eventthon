/**
 * Service catalog: primary categories, subcategories (enriched iconUi), skills.
 * Re-exported from ../globalCategories.js for stable import paths.
 */

import { deriveSubIconUi } from './iconUiPresets.js';
import { PRIMARY_SERVICE_CATEGORIES } from './primaryCategories.js';
import { RAW_SUBCATEGORIES_BY_PARENT } from './subcategoriesCatalog.js';

function buildSubcategoryItemsForParent(parentCat) {
  const rows = RAW_SUBCATEGORIES_BY_PARENT[parentCat.name];
  if (!Array.isArray(rows)) return [];
  return rows.map(([name, iconKey], index) => ({
    name,
    iconKey,
    iconUi: deriveSubIconUi(parentCat.iconUi, index),
    parentName: parentCat.name,
  }));
}

/** Full category rows as consumed by Gigs + Edit Profile (subcategories stay string[]). */
export const GLOBAL_SERVICE_CATEGORY_OPTIONS = PRIMARY_SERVICE_CATEGORIES.map((cat) => {
  const subcategoryItems = buildSubcategoryItemsForParent(cat);
  return {
    ...cat,
    subcategories: subcategoryItems.map((s) => s.name),
    subcategoryItems,
  };
});

export const GLOBAL_SERVICE_CATEGORIES = GLOBAL_SERVICE_CATEGORY_OPTIONS.map((item) => item.name);

export { PRIMARY_SERVICE_CATEGORIES } from './primaryCategories.js';
export { RAW_SUBCATEGORIES_BY_PARENT } from './subcategoriesCatalog.js';
export { deriveSubIconUi, deriveSkillIconUi } from './iconUiPresets.js';
export { GLOBAL_SKILL_OPTIONS, GLOBAL_SKILL_NAMES } from './globalSkillCatalog.js';

/** Lookup sub rows with icons for a primary category name. */
export function getSubcategoryItemsForParent(parentName) {
  const cat = GLOBAL_SERVICE_CATEGORY_OPTIONS.find((c) => c.name === parentName);
  return cat?.subcategoryItems ?? [];
}

export const GLOBAL_PROFESSIONAL_NICHES = [
  'Frontend Engineer',
  'Backend Engineer',
  'Full Stack Developer',
  'UI/UX Designer',
  'SEO Specialist',
  'Performance Marketer',
  'AI Engineer',
  'Data Analyst',
  'DevOps Engineer',
  'Project Manager',
];
