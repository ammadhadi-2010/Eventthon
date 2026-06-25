/** Maps browse UI selections to backend list_gigs query semantics */

export const BUDGET_BUCKET_RANGES = {
  'Under $50': { lo: 0, hi: 49.99 },
  '$50 - $150': { lo: 50, hi: 150 },
  '$150 - $300': { lo: 150, hi: 300 },
  '$300 - $600': { lo: 300, hi: 600 },
  '$600 - $1000': { lo: 600, hi: 1000 },
  '$1000+': { lo: 1000, hi: 1e9 },
};

export const DELIVERY_LABEL_TO_MAX_DAYS = {
  Any: null,
  'Within 24 Hours': 1,
  'Up to 3 Days': 3,
  'Up to 5 Days': 5,
  'Up to 7 Days': 7,
  'Up to 14 Days': 14,
  Custom: null,
};

export const SELLER_LEVEL_MIN_RATING = {
  'Top Rated': 4.6,
  'Level 2': 4.35,
  'Level 1': 4.0,
  'Rising Talent': 3.7,
  'New Seller': 0,
};

export const SORT_UI_TO_API = {
  'Best Match': '',
  'Newest First': 'recent',
  'Top Rated Seller': 'reviews',
  'Most Reviewed': 'reviews',
  'Fastest Delivery': 'fastest_delivery',
};

export function encodeBudgetBuckets(selectedLabels = []) {
  const parts = (Array.isArray(selectedLabels) ? selectedLabels : [])
    .map((label) => BUDGET_BUCKET_RANGES[label])
    .filter(Boolean)
    .map(({ lo, hi }) => `${lo}:${hi}`);
  return parts.join('|');
}
