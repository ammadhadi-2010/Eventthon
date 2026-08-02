/** Always resolve a logo image for jobs and opportunities. */

const DOMAIN_BY_KEY = {
  google: 'google.com',
  microsoft: 'microsoft.com',
  amazon: 'amazon.com',
  netflix: 'netflix.com',
  figma: 'figma.com',
  stripe: 'stripe.com',
  spotify: 'spotify.com',
  airbnb: 'airbnb.com',
  openai: 'openai.com',
  shopify: 'shopify.com',
  uber: 'uber.com',
  cloudflare: 'cloudflare.com',
  atlassian: 'atlassian.com',
  notion: 'notion.so',
  salesforce: 'salesforce.com',
  chrome: 'google.com',
  meta: 'meta.com',
  apple: 'apple.com',
  pixelcraft: 'github.com',
  stackbridge: 'github.com',
  rankflow: 'github.com',
  storyline: 'github.com',
  colormint: 'github.com',
  neuralforge: 'github.com',
  apporbit: 'github.com',
  sitemakers: 'github.com',
};

const DOMAIN_BY_COMPANY = {
  google: 'google.com',
  microsoft: 'microsoft.com',
  amazon: 'amazon.com',
  netflix: 'netflix.com',
  figma: 'figma.com',
  stripe: 'stripe.com',
  spotify: 'spotify.com',
  airbnb: 'airbnb.com',
  openai: 'openai.com',
  shopify: 'shopify.com',
  uber: 'uber.com',
  cloudflare: 'cloudflare.com',
  atlassian: 'atlassian.com',
  notion: 'notion.so',
  salesforce: 'salesforce.com',
};

function faviconUrl(domain) {
  if (!domain) return '';
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
}

function avatarUrl(name, isOpportunity) {
  const label = String(name || (isOpportunity ? 'Opportunity' : 'Job')).trim() || 'ET';
  const bg = isOpportunity ? '0284c7' : '4f46e5';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(label.slice(0, 24))}&background=${bg}&color=fff&size=128&bold=true&format=png`;
}

function isOpportunityKind(listingKind, alertKind) {
  const kind = String(listingKind || alertKind || '').toLowerCase();
  return kind === 'opportunity';
}

/**
 * Prefer stored company logo, then known brand favicon, then generated avatar
 * so every job / opportunity row always has a logo image.
 */
export function resolveCompanyLogoUrl({
  imageurl = '',
  company = '',
  logoClass = '',
  logoText = '',
  listingKind = '',
  alertKind = '',
} = {}) {
  const direct = String(imageurl || '').trim();
  if (direct) return direct;

  const opportunity = isOpportunityKind(listingKind, alertKind);

  const classKey = String(logoClass || '').trim().toLowerCase();
  if (!opportunity && DOMAIN_BY_KEY[classKey]) return faviconUrl(DOMAIN_BY_KEY[classKey]);

  const companyKey = String(company || '')
    .trim()
    .toLowerCase()
    .split(/\s+/)[0];
  if (!opportunity && DOMAIN_BY_COMPANY[companyKey]) {
    return faviconUrl(DOMAIN_BY_COMPANY[companyKey]);
  }

  const label = company || logoText || (opportunity ? 'Opportunity' : 'Job');
  return avatarUrl(label, opportunity);
}
