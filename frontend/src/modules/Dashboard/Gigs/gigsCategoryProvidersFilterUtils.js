/** Client-side facets for category providers browse (subset of gigs in memory). */

import API from '../../../api/axiosConfig';
import { normalizeGig, unwrapGigArrays } from './gigExplorer/model';
import { SORT_UI_TO_API } from './utils/gigsBrowseConstants';

export function buildCategoryGigsQueryParams({
  category,
  sortLabel,
  selectedSubcategory,
  appliedFilters,
}) {
  const sortApi = SORT_UI_TO_API[sortLabel] ?? '';
  return {
    status: 'Published',
    category,
    limit: 100,
    skip: 0,
    ...(sortApi ? { sort: sortApi } : {}),
    ...(selectedSubcategory ? { service_type: selectedSubcategory } : {}),
    ...(appliedFilters.priceMin != null && Number.isFinite(appliedFilters.priceMin)
      ? { min_price: appliedFilters.priceMin }
      : {}),
    ...(appliedFilters.priceMax != null && Number.isFinite(appliedFilters.priceMax)
      ? { max_price: appliedFilters.priceMax }
      : {}),
    ...(appliedFilters.deliveryBuckets?.length
      ? { delivery_buckets: appliedFilters.deliveryBuckets.join('|') }
      : {}),
    ...(appliedFilters.sellerLevels?.length
      ? { seller_levels: appliedFilters.sellerLevels.join('|') }
      : {}),
  };
}

export async function fetchCategoryGigsList(query) {
  const res = await API.get('/api/gigs', { params: query });
  const raw = unwrapGigArrays(res).map(normalizeGig);
  const total = Number(res?.data?.total);
  return {
    gigs: raw,
    total: Number.isFinite(total) ? total : raw.length,
  };
}

export async function fetchCategoryBrowseFacets(category, subLabels = []) {
  const res = await API.get('/api/gigs/browse/facets', {
    params: {
      category,
      ...(subLabels.length ? { sub_labels: subLabels } : {}),
    },
  });
  return res?.data || null;
}

export function gigMatchesServiceSub(gig, subLabel) {
  if (!subLabel) return true;
  const needle = String(subLabel).toLowerCase();
  const serviceType = String(gig.serviceType || '').toLowerCase();
  if (serviceType.includes(needle)) return true;
  const title = String(gig.title || '').toLowerCase();
  if (title.includes(needle)) return true;
  const tags = Array.isArray(gig.tags) ? gig.tags.map((t) => String(t).toLowerCase()) : [];
  if (tags.some((t) => t.includes(needle))) return true;
  return false;
}

export const PRICE_SLIDER_MAX = 1000;

export function createEmptyRailDraft() {
  return {
    priceSliderMin: 0,
    priceSliderMax: PRICE_SLIDER_MAX,
    priceInputMin: '',
    priceInputMax: '',
    deliveryBuckets: [],
    sellerLevels: [],
  };
}

export function createEmptyAppliedFilters() {
  return {
    priceMin: null,
    priceMax: null,
    deliveryBuckets: [],
    sellerLevels: [],
  };
}

export function appliedFiltersFromRailDraft(railDraft) {
  const { min, max } = resolvePriceFromDraft(railDraft);
  return {
    priceMin: min,
    priceMax: max,
    deliveryBuckets: [...railDraft.deliveryBuckets],
    sellerLevels: [...railDraft.sellerLevels],
  };
}

export function sellerBucketId(gig) {
  const lvl = String(gig.sellerLevel || '');
  const r = gig.rating;
  if (/top\s*rated/i.test(lvl)) return 'top';
  if (/level\s*2/i.test(lvl)) return 'lvl2';
  if (/level\s*1/i.test(lvl)) return 'lvl1';
  if (r === 'New' || /new\s*seller/i.test(lvl)) return 'new';
  return '';
}

export function gigMatchesDeliveryBucket(gig, bucketId) {
  const d = Number(gig.deliveryDays) || 0;
  if (bucketId === '24h') return d <= 1;
  if (bucketId === '3d') return d >= 2 && d <= 3;
  if (bucketId === '7d') return d >= 4 && d <= 7;
  if (bucketId === 'week_plus') return d > 7;
  return true;
}

export function gigsMatchDeliveryBuckets(gig, buckets) {
  if (!Array.isArray(buckets) || buckets.length === 0) return true;
  return buckets.some((b) => gigMatchesDeliveryBucket(gig, b));
}

export function gigsMatchSellerLevels(gig, keys) {
  if (!Array.isArray(keys) || keys.length === 0) return true;
  const id = sellerBucketId(gig);
  return id && keys.includes(id);
}

export function resolvePriceFromDraft(draft) {
  const inLo = draft.priceInputMin === '' ? null : Number(draft.priceInputMin);
  const inHi = draft.priceInputMax === '' ? null : Number(draft.priceInputMax);
  const rawLo = Number(draft.priceSliderMin);
  const rawHi = Number(draft.priceSliderMax);
  const sLo = Number.isFinite(rawLo) ? rawLo : 0;
  const sHi = Number.isFinite(rawHi) ? rawHi : PRICE_SLIDER_MAX;
  let min =
    inLo != null && Number.isFinite(inLo)
      ? inLo
      : sLo > 0
        ? sLo
        : null;
  let max =
    inHi != null && Number.isFinite(inHi)
      ? inHi
      : sHi < PRICE_SLIDER_MAX
        ? sHi
        : null;
  if (min != null && max != null && min > max) {
    const t = min;
    min = max;
    max = t;
  }
  return { min, max };
}
