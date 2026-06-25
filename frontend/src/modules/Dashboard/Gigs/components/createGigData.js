export const GIG_PACKAGE_TIER_KEYS = ['basic', 'standard', 'premium'];

export const TIER_LABELS = { basic: 'Basic', standard: 'Standard', premium: 'Premium' };

export const DEFAULT_GIG_PRICING_TIERS = {
  basic: {
    price: '49',
    deliveryDays: '3',
    revisions: '1',
    features: ['Core delivery', '1 revision round', 'Message support'],
  },
  standard: {
    price: '120',
    deliveryDays: '5',
    revisions: '2',
    features: ['Full service scope', '2 revision rounds', 'Priority support'],
  },
  premium: {
    price: '228',
    deliveryDays: '10',
    revisions: '4',
    features: ['Premium polish', '4 revision rounds', 'Fast delivery', 'Source files'],
  },
};

export function createInitialGigPricingTiers() {
  return {
    basic: { ...DEFAULT_GIG_PRICING_TIERS.basic, features: [...DEFAULT_GIG_PRICING_TIERS.basic.features] },
    standard: {
      ...DEFAULT_GIG_PRICING_TIERS.standard,
      features: [...DEFAULT_GIG_PRICING_TIERS.standard.features],
    },
    premium: {
      ...DEFAULT_GIG_PRICING_TIERS.premium,
      features: [...DEFAULT_GIG_PRICING_TIERS.premium.features],
    },
  };
}
