function mapTierPackages(tiers, fallbackDays) {
  const order = [
    ['basic', 'Basic'],
    ['standard', 'Standard'],
    ['premium', 'Premium'],
  ];
  return order
    .map(([id, name]) => {
      const row = tiers[id];
      if (!row || typeof row !== 'object') return null;
      const features = Array.isArray(row.features)
        ? row.features.filter(Boolean)
        : String(row.features || '')
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean);
      return {
        id,
        name,
        price: Number(row.price || 0),
        description: row.description || `${name} package with scoped deliverables.`,
        deliveryDays: Number(row.deliveryDays || row.delivery_days || fallbackDays),
        revisions: Number(row.revisions || 1),
        popular: id === 'standard',
        features: features.length ? features : [`${name} deliverables`],
      };
    })
    .filter(Boolean);
}

export function buildGigPackages(data) {
  if (Array.isArray(data.packages) && data.packages.length) {
    return data.packages;
  }
  const tiers = data.pricing_tiers || data.pricing?.pricing_tiers;
  if (tiers && typeof tiers === 'object') {
    const mapped = mapTierPackages(tiers, Number(data.deliveryDays) || 5);
    if (mapped.length) return mapped;
  }
  const days = Number(data.deliveryDays) || 5;
  const roundDays = (n) => Math.max(1, Math.round(n));
  const isSeo =
    String(data.professionalRole || data.breadcrumbCategory || '')
      .toLowerCase()
      .includes('seo') ||
    String(data.gigTitle || '')
      .toLowerCase()
      .includes('seo');
  const base = isSeo ? 120 : Number(data.startingPrice) || 149;

  const seoFeatures = {
    basic: ['SEO Audit (Up to 150 Pages)', 'On-Page Optimization Report', 'Keywords Research (50)'],
    standard: ['Everything in Basic', 'Technical SEO Fixes', 'Competitor Analysis', 'Keywords Research (150)'],
    premium: ['Everything in Standard', 'Full Site SEO Strategy', 'Backlink Outreach Plan', '30-Day Support'],
  };
  const genericFeatures = {
    basic: ['Core deliverables', 'Source files', '1 revision'],
    standard: ['Everything in Basic', '3 revisions', 'Priority delivery'],
    premium: ['Everything in Standard', 'Premium support', 'Rush delivery'],
  };
  const feat = isSeo ? seoFeatures : genericFeatures;

  return [
    { id: 'basic', name: 'Basic', price: base, description: 'Essential deliverables with standard turnaround.', deliveryDays: days, revisions: 1, features: feat.basic },
    { id: 'standard', name: 'Standard', price: Math.round(base * 2), description: 'Most popular package with extended revisions.', deliveryDays: roundDays(days * 0.85), revisions: 3, popular: true, features: feat.standard },
    { id: 'premium', name: 'Premium', price: Math.round(base * 3.75), description: 'Full-service bundle with premium support.', deliveryDays: roundDays(days * 0.65), revisions: 5, features: feat.premium },
  ];
}

export const GIG_TRUST_BADGES = [
  { key: 'secure', label: 'Secure Payment' },
  { key: 'satisfaction', label: '100% Satisfaction' },
  { key: 'support', label: '24/7 Support' },
  { key: 'verified', label: 'ET Verified Seller' },
  { key: 'ontime', label: 'On-time Delivery' },
];

export const GIG_DELIVERABLES = ['PDF', 'XLSX', 'DOCX', 'MP4'];

export function buildGigReviews(data) {
  if (Array.isArray(data.reviews) && data.reviews.length) {
    return data.reviews;
  }
  const seller = data.creatorBadge?.displayName || data.seller?.displayName || 'Creator';
  return [
    { id: 'r1', name: 'Sarah Mitchell', country: 'United States', rating: 5, text: `Outstanding work from ${seller}. Delivered ahead of schedule with clear communication.` },
    { id: 'r2', name: 'James Chen', country: 'Canada', rating: 5, text: 'Professional quality and attention to detail. Would order again on EventThon.' },
    { id: 'r3', name: 'Elena Rodriguez', country: 'Spain', rating: 5, text: 'Great results and fast revisions. Highly recommended for marketplace buyers.' },
    { id: 'r4', name: 'David Park', country: 'United Kingdom', rating: 4, text: 'Clear reporting and actionable SEO recommendations for our global storefront.' },
  ];
}

export function buildRelatedGigs(data) {
  if (Array.isArray(data.relatedGigs) && data.relatedGigs.length) {
    return data.relatedGigs;
  }
  return [];
}

export function truncateTitle(title, max = 48) {
  const t = String(title || '').trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}
