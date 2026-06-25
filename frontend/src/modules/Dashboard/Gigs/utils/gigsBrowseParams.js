import {
  DELIVERY_LABEL_TO_MAX_DAYS,
  SORT_UI_TO_API,
  SELLER_LEVEL_MIN_RATING,
  encodeBudgetBuckets,
} from './gigsBrowseConstants';

function sellerLevelsToMinRating(levels) {
  if (!Array.isArray(levels) || levels.length !== 1) return undefined;
  const v = SELLER_LEVEL_MIN_RATING[levels[0]];
  return typeof v === 'number' && v > 0 ? v : undefined;
}

/**
 * Axios params for GET /api/gigs from browse drawer + hero search.
 */
export function buildGigsListAxiosParams(filters = {}, { marketplacePublished = false } = {}) {
  const f = filters || {};
  const deliveryMax = DELIVERY_LABEL_TO_MAX_DAYS[f.delivery_label] ?? null;

  const params = {};

  const q = typeof f.search === 'string' ? f.search.trim() : '';
  if (q) params.search = q;

  const cat = typeof f.category === 'string' ? f.category.trim() : '';
  if (cat) params.category = cat;

  const sellerId = typeof f.seller_user_id === 'string' ? f.seller_user_id.trim() : '';
  if (sellerId) params.seller_user_id = sellerId;

  const sf = typeof f.service_focus === 'string' ? f.service_focus.trim() : '';
  if (sf) params.service_type = sf;

  const sortLabel = typeof f.sort_label === 'string' ? f.sort_label : 'Best Match';
  const sortApi = SORT_UI_TO_API[sortLabel] ?? '';
  if (sortApi) params.sort = sortApi;

  const buckets = encodeBudgetBuckets(f.budget_buckets || []);
  if (buckets) params.budget_ranges = buckets;

  const mr = sellerLevelsToMinRating(f.seller_levels || []);
  if (typeof mr === 'number') params.min_rating = mr;

  if (deliveryMax != null && deliveryMax > 0) {
    params.delivery_days_max = deliveryMax;
  }

  if (marketplacePublished) params.status = 'Published';

  return params;
}
