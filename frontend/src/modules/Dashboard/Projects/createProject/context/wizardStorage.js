import { getSubcategoryItemsForParent } from '../../../../../data/serviceCatalog';
import { INITIAL_WIZARD_DATA, normalizeWizardPricingTiers } from '../data/createProjectWizardData';

const DATA_KEY = 'eventthon:create-project:wizard';
const STEP_KEY = 'eventthon:create-project:step';

const LEGACY_CATEGORY_IDS = {
  ai: 'AI & Automation',
  web: 'Web Development',
  mobile: 'Mobile Development',
  design: 'Design & Creative',
};

function migrateWizardPayload(parsed) {
  if (LEGACY_CATEGORY_IDS[parsed.category]) {
    parsed.category = LEGACY_CATEGORY_IDS[parsed.category];
    parsed.subCategory = '';
  }
  return parsed;
}

export function loadWizardData() {
  try {
    const raw = sessionStorage.getItem(DATA_KEY);
    if (!raw) return { ...INITIAL_WIZARD_DATA };
    const parsed = migrateWizardPayload(JSON.parse(raw));
    const merged = { ...INITIAL_WIZARD_DATA, ...parsed };
    merged.pricingTiers = normalizeWizardPricingTiers(merged.pricingTiers);
    if (!merged.subCategory && merged.category) {
      merged.subCategory = getSubcategoryItemsForParent(merged.category)[0]?.name || '';
    }
    return merged;
  } catch {
    return { ...INITIAL_WIZARD_DATA };
  }
}

export function saveWizardData(data) {
  try {
    sessionStorage.setItem(DATA_KEY, JSON.stringify(data));
  } catch {
    /* ignore quota errors */
  }
}

export function loadWizardStep() {
  const raw = sessionStorage.getItem(STEP_KEY);
  const step = Number(raw);
  return step >= 1 && step <= 6 ? step : 1;
}

export function saveWizardStep(step) {
  sessionStorage.setItem(STEP_KEY, String(step));
}

export function clearWizardStorage() {
  sessionStorage.removeItem(DATA_KEY);
  sessionStorage.removeItem(STEP_KEY);
}
