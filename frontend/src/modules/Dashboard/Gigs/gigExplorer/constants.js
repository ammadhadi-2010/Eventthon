export const DETAIL_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'aboutSeller', label: 'About Seller' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'faq', label: 'FAQ' },
];

export const tabIdFromHash = () => {
  if (typeof window === 'undefined') return null;
  const h = window.location.hash.replace(/^#/, '');
  const found = DETAIL_TABS.find((t) => t.id === h);
  return found ? found.id : null;
};

export const hashForTab = (tabId) => `#${tabId}`;

function tierFromStored(key, label, raw) {
  if (!raw || typeof raw !== 'object') return null;
  return {
    key,
    label,
    price: Number(raw.price) || 0,
    delivery: Number(raw.deliveryDays ?? raw.delivery) || 3,
    revisions: Number(raw.revisions) || 2,
    features: Array.isArray(raw.features) ? raw.features : [],
  };
}

export const derivePackageTiers = (gig) => {
  const stored = gig.pricingTiers || gig.pricing?.pricing_tiers;
  if (stored?.basic || stored?.standard || stored?.premium) {
    return ['basic', 'standard', 'premium']
      .map((key) => tierFromStored(key, key.charAt(0).toUpperCase() + key.slice(1), stored[key]))
      .filter(Boolean);
  }
  const base = Number(gig.price) > 0 ? Number(gig.price) : 49;
  const d = Number(gig.deliveryDays) || 3;
  const rev = Number(gig.revisions) || 2;
  return [
    { key: 'basic', label: 'Basic', price: base, delivery: d, revisions: Math.max(1, rev - 1) },
    { key: 'standard', label: 'Standard', price: Math.round(base * 1.45), delivery: d + 2, revisions: rev },
    { key: 'premium', label: 'Premium', price: Math.round(base * 1.9), delivery: d + 5, revisions: rev + 2 },
  ];
};

export const REVIEW_SNIPPETS = [
  'Clear communication and fast delivery.',
  'Exactly what we needed — will order again.',
  'Professional output and receptive to revisions.',
  'Great attention to detail on the brief.',
  'Solid quality for the price point.',
];

export const buildReviewRows = (gig) => {
  const total = Number(gig.reviews) || 0;
  if (total <= 0) return [];
  const n = Math.min(total, 5);
  const baseRating =
    gig.rating === 'New'
      ? 4.8
      : Number(String(gig.rating).replace(/[^\d.]/g, '')) || 4.8;
  return Array.from({ length: n }, (_, index) => {
    const jitter = ((index % 3) - 1) * 0.08;
    const stars = Math.min(5, Math.max(4.2, baseRating + jitter));
    return {
      id: `${gig.id}-rev-${index}`,
      name: `Buyer #${8400 + index * 173}`,
      serviceType: gig.title || 'Gig service',
      stars: stars.toFixed(1),
      text: REVIEW_SNIPPETS[index % REVIEW_SNIPPETS.length],
      ago: `${index + 2} weeks ago`,
    };
  });
};

export const FAQ_ITEMS = [
  {
    q: 'What do I need to get started?',
    a: 'Share your goals, timelines, brand assets if any, and any reference links. The more context, the better the delivery.',
  },
  {
    q: 'Can I request revisions?',
    a: 'Yes. Revision limits depend on the package you choose. Contact the seller before ordering if you need extra rounds.',
  },
  {
    q: 'How do I hire during the global beta?',
    a: 'Choose a package and tap Inquire & Chat. We create a free in-progress order and open Messages so you can negotiate directly — no payment checkout yet.',
  },
];

export const MONGO_ID_REGEX = /^[a-f\d]{24}$/i;

const FOLLOW_STORAGE = 'eventthon:gigFollowedSellerIds:v1';

export const readFollowedSellerIds = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(FOLLOW_STORAGE);
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === 'string' && x.length > 0) : [];
  } catch {
    return [];
  }
};

export const toggleFollowSellerInStorage = (sellerUserId) => {
  if (!sellerUserId || typeof window === 'undefined') return { next: [], nowFollowing: false };
  const cur = readFollowedSellerIds();
  const idx = cur.indexOf(sellerUserId);
  let next;
  let nowFollowing;
  if (idx >= 0) {
    next = cur.filter((id) => id !== sellerUserId);
    nowFollowing = false;
  } else {
    next = [...cur, sellerUserId];
    nowFollowing = true;
  }
  window.localStorage.setItem(FOLLOW_STORAGE, JSON.stringify(next));
  return { next, nowFollowing };
};

export const isSellerFollowedInStorage = (sellerUserId) => {
  if (!sellerUserId) return false;
  return readFollowedSellerIds().includes(sellerUserId);
};
