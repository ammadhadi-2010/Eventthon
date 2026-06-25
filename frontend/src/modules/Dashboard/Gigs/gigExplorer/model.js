import { API_BASE_URL } from '../../../../api/axiosConfig';
import { featuredGigs, recentGigs } from '../data/gigsData';
import { derivePublicSeller } from '../utils/publicSellerDisplay';

export const unwrapGigArrays = (axiosResponse) => {
  const body = axiosResponse?.data;
  if (!body || typeof body !== 'object') return [];
  if (Array.isArray(body.gigs)) return body.gigs;
  if (Array.isArray(body)) return body;
  return [];
};

export const resolveMediaUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return `${API_BASE_URL}${url}`;
  return url;
};

export const normalizeGig = (item) => {
  const coverUrl = item?.imageurl || item?.cover_imageurl || '';
  const imagesRaw = item?.gallery?.images || item?.image_urls || item?.images || [];
  const filesRaw = item?.gallery?.files || item?.file_urls || item?.files || [];
  const pricing = item?.pricing || {};
  const packageFeatures = Array.isArray(pricing?.package_features)
    ? pricing.package_features
    : String(pricing?.package_features || '')
      .split('\n')
      .map((x) => x.trim())
      .filter(Boolean);
  const pricingTiers = pricing?.pricing_tiers || item?.pricing_tiers || null;
  const addons = Array.isArray(pricing?.addons) ? pricing.addons : [];
  const rawRating = item?.rating;
  const numericRating = rawRating !== undefined && rawRating !== null ? Number(rawRating) : NaN;
  const images = Array.isArray(imagesRaw)
    ? imagesRaw.map(resolveMediaUrl)
    : coverUrl
      ? [resolveMediaUrl(coverUrl)]
      : [];
  const files = Array.isArray(filesRaw) ? filesRaw.map(resolveMediaUrl) : [];
  const sellerPublic = derivePublicSeller(item?.seller_name, item?.seller_user_id);
  return {
    id: item?._id || item?.id || `${item?.title || 'gig'}-${Math.random().toString(36).slice(2, 8)}`,
    title: item?.title || 'Untitled Gig',
    description: item?.description || 'No description yet.',
    sellerName: sellerPublic.label,
    sellerAvatarInitial: sellerPublic.avatarInitial,
    sellerLevel: item?.seller_level || 'Level 1 Seller',
    rating: numericRating > 0 ? String(numericRating) : 'New',
    reviews: Number(item?.reviews ?? item?.orders ?? item?.orders_count ?? 0),
    category: item?.category || 'General',
    serviceType: item?.service_type || 'General',
    deliveryTime: item?.delivery_time || '',
    tags: Array.isArray(item?.tags) ? item.tags : [],
    price: Number(item?.starting_price ?? pricing?.starting_price ?? 0),
    deliveryDays: Number(pricing?.delivery_days ?? item?.delivery_days ?? 3),
    revisions: Number(pricing?.revisions_included ?? item?.revisions_included ?? 2),
    packageFeatures,
    pricingTiers,
    pricing,
    addons,
    visibility: item?.visibility || 'public',
    status: item?.status || 'Draft',
    ownerType: (item?.owner_type || 'user').toLowerCase(),
    squadId: item?.squad_id || '',
    squadName: item?.squad_name || '',
    sellerUserId: String(item?.seller_user_id ?? '').trim(),
    imageurl: coverUrl ? resolveMediaUrl(coverUrl) : images[0] || '',
    images,
    files,
  };
};

export const staticSeed = () => {
  const featured = featuredGigs.map((gig, index) => ({
    id: `seed-feature-${index + 1}`,
    title: gig.title,
    description: `Featured service in ${gig.sellerLevel}.`,
    sellerName: gig.seller,
    sellerAvatarInitial: (gig.seller || 'S').charAt(0).toUpperCase(),
    sellerLevel: gig.sellerLevel,
    rating: gig.rating,
    reviews: gig.reviews,
    category: 'Featured',
    serviceType: 'Full Stack',
    deliveryTime: '3 Days',
    tags: ['Featured', 'Trusted'],
    price: Number(String(gig.price).replace(/[^\d]/g, '')) || 0,
    deliveryDays: 2,
    revisions: 2,
    packageFeatures: ['SEO Audit Report', 'Keyword Analysis', 'On-Page Recommendations'],
    addons: ['Express Delivery'],
    visibility: 'public',
    status: 'Published',
    ownerType: 'user',
    squadId: '',
    squadName: '',
    sellerUserId: '',
    images: [],
    files: [],
  }));
  const recent = recentGigs.map((gig, index) => ({
    id: `seed-recent-${gig.id}`,
    title: gig.title,
    description: `${gig.seller} provides this service with ${gig.sellerLevel}.`,
    sellerName: gig.seller,
    sellerAvatarInitial: (gig.seller || 'S').charAt(0).toUpperCase(),
    sellerLevel: gig.sellerLevel,
    rating: String(gig.rating),
    reviews: gig.reviews,
    category: 'Recent',
    serviceType: 'Frontend Development',
    deliveryTime: '7 Days',
    tags: gig.tags,
    price: Number(String(gig.price).replace(/[^\d]/g, '')) || 0,
    deliveryDays: Number(String(gig.eta).replace(/[^\d]/g, '')) || 2,
    revisions: 2,
    packageFeatures: ['Service Delivery', 'Support', 'Detailed Output'],
    addons: ['Priority Delivery'],
    visibility: 'public',
    status: 'Published',
    ownerType: index % 3 === 0 ? 'squad' : 'user',
    squadId: index % 3 === 0 ? 'demo-squad' : '',
    squadName: index % 3 === 0 ? 'Demo Squad' : '',
    sellerUserId: '',
    images: [],
    files: [],
  }));
  return [...featured, ...recent];
};
