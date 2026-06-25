import {
  GLOBAL_SERVICE_CATEGORY_OPTIONS,
  getSubcategoryItemsForParent,
} from '../../../../../data/serviceCatalog';
import { PROJECT_CATEGORIES } from '../../data/projectsHubData';

const HUB_TO_CATALOG = {
  'AI & Machine Learning': 'AI & Automation',
  'Mobile Apps': 'Mobile Development',
};

export function hubLabelToCatalogName(label) {
  return HUB_TO_CATALOG[label] || label;
}

/** Primary categories: Projects hub order first, then remaining catalog entries. */
export function getProjectCategoryOptions() {
  const byName = new Map(GLOBAL_SERVICE_CATEGORY_OPTIONS.map((c) => [c.name, c]));
  const ordered = [];
  PROJECT_CATEGORIES.forEach((hub) => {
    const name = hubLabelToCatalogName(hub.label);
    if (byName.has(name)) ordered.push(byName.get(name));
  });
  GLOBAL_SERVICE_CATEGORY_OPTIONS.forEach((c) => {
    if (!ordered.some((o) => o.name === c.name)) ordered.push(c);
  });
  return ordered;
}

export function getProjectSubcategories(parentName) {
  return getSubcategoryItemsForParent(parentName);
}
