import {
  EMPTY_EDIT_WIZARD_BASE,
  INITIAL_WIZARD_DATA,
  normalizeWizardPricingTiers,
} from '../data/createProjectWizardData';
import { getSubcategoryItemsForParent } from '../../../../../data/serviceCatalog';

export function formatBudgetRange(min, max) {
  const a = Number(min);
  const b = Number(max);
  if (!a && !b) return '';
  if (!b || b <= a) return `$${Number(min).toLocaleString()}`;
  return `$${a.toLocaleString()} - $${b.toLocaleString()}`;
}

export function withNormalizedPricing(merged, pricingSource) {
  const next = { ...merged };
  next.pricingTiers = normalizeWizardPricingTiers(
    pricingSource ?? merged.pricingTiers ?? INITIAL_WIZARD_DATA.pricingTiers,
  );
  if (!next.subCategory && next.category) {
    next.subCategory = getSubcategoryItemsForParent(next.category)[0]?.name || '';
  }
  return next;
}

export function mergeWizardState(stored, initialData, { editMode = false } = {}) {
  if (editMode) {
    return withNormalizedPricing(
      { ...EMPTY_EDIT_WIZARD_BASE, ...(initialData || {}) },
      initialData?.pricingTiers,
    );
  }
  const base = { ...INITIAL_WIZARD_DATA, ...stored };
  if (!initialData) {
    return withNormalizedPricing(base, base.pricingTiers);
  }
  const merged = { ...base, ...initialData };
  return withNormalizedPricing(merged, initialData.pricingTiers ?? base.pricingTiers);
}
