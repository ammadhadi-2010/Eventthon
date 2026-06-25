/** Maps raw public gig API payload into showroom view model. */

function asArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function resolveImageUrl(raw = {}) {
  const hit = [
    raw.imageurl,
    raw.imageUrl,
    raw.previewImageUrl,
    raw.avatar,
    raw.cover_preview,
    raw.thumbnail,
  ].find((value) => typeof value === 'string' && value.trim().length > 0);
  return hit ? hit.trim() : '';
}

function normalizePackage(row) {
  if (!row || typeof row !== 'object') return null;
  const id = String(row.id || row.tier || 'basic').toLowerCase();
  const features = asArray(row.features).map((item) => String(item).trim()).filter(Boolean);
  return {
    id,
    name: String(row.name || id.charAt(0).toUpperCase() + id.slice(1)),
    price: Number(row.price || 0),
    description: String(row.description || '').trim(),
    deliveryDays: Number(row.deliveryDays || row.delivery_days || 5),
    revisions: Number(row.revisions || 1),
    popular: Boolean(row.popular || id === 'standard'),
    features,
  };
}

function mapPricingTiers(tiers, fallbackDays = 5) {
  const order = [
    ['basic', 'Basic'],
    ['standard', 'Standard'],
    ['premium', 'Premium'],
  ];
  return order
    .map(([key, label]) => {
      const row = tiers[key];
      if (!row || typeof row !== 'object') return null;
      const features = asArray(row.features).map((item) => String(item).trim()).filter(Boolean);
      return {
        id: key,
        name: label,
        price: Number(row.price || 0),
        description: String(row.description || `${label} package with scoped deliverables.`),
        deliveryDays: Number(row.deliveryDays || row.delivery_days || fallbackDays),
        revisions: Number(row.revisions || 1),
        popular: key === 'standard',
        features,
      };
    })
    .filter(Boolean);
}

export function mapPublicGigShowroom(raw = {}) {
  const imageurl = resolveImageUrl(raw);
  const packages = asArray(raw.packages).map(normalizePackage).filter(Boolean);
  const tierSource = raw.pricing_tiers || raw.pricing?.pricing_tiers;
  const tierPackages =
    packages.length || !tierSource || typeof tierSource !== 'object'
      ? packages
      : mapPricingTiers(tierSource, Number(raw.deliveryDays || 5));

  return {
    ...raw,
    imageurl,
    previewImageUrl: imageurl || raw.previewImageUrl || '',
    gigTitle: String(raw.gigTitle || raw.displayName || raw.title || 'Gig').trim(),
    breadcrumbCategory: String(
      raw.breadcrumbCategory || raw.professionalRole || raw.category || 'Marketplace',
    ).trim(),
    packages: tierPackages,
    relatedGigs: asArray(raw.relatedGigs).map((gig) => ({
      ...gig,
      imageurl: resolveImageUrl(gig) || gig.imageurl || '',
    })),
  };
}
