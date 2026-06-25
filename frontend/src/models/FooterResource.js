/** Footer CMS schema — Resources + Company footer blocks. */

export const FOOTER_RESOURCE_CATEGORIES = [
  'Documentation',
  'Guides',
  'Tutorials',
  'Blog',
  'Case Studies',
  'Help Center',
  'Community',
];

export const FOOTER_COMPANY_CATEGORIES = [
  'About Us',
  'Pricing',
  'Careers',
  'Contact Us',
  'Privacy Policy',
  'Terms of Service',
];

export const FOOTER_ALL_CATEGORIES = [
  ...FOOTER_RESOURCE_CATEGORIES,
  ...FOOTER_COMPANY_CATEGORIES,
];

export const FOOTER_CATEGORY_GROUPS = [
  { id: 'resources', label: 'Resources', items: FOOTER_RESOURCE_CATEGORIES },
  { id: 'company', label: 'Company', items: FOOTER_COMPANY_CATEGORIES },
];

export const FOOTER_RESOURCE_SCHEMA = {
  category: { type: 'enum', values: FOOTER_ALL_CATEGORIES, required: true, index: true },
  footerBlock: { type: 'enum', values: ['resources', 'company'], auto: true },
  title: { type: 'string', maxLength: 160, required: true },
  slug: { type: 'string', maxLength: 140, auto: true },
  content: { type: 'richtext', maxLength: 12000 },
  imageurl: { type: 'url', maxLength: 500, layout: 'cover' },
  videourl: { type: 'url', maxLength: 500, layout: 'iframe' },
  excerpt: { type: 'string', maxLength: 2000, layout: 'summary' },
  sidebarOrder: { type: 'number', min: 0, max: 9999, layout: 'sidebar-sort' },
  readTime: { type: 'string', maxLength: 40, layout: 'blog-metric' },
  authorName: { type: 'string', maxLength: 120 },
  authorAvatarUrl: { type: 'url', maxLength: 500 },
  externalUrl: { type: 'url', maxLength: 500, layout: 'redirect' },
  pricingLabel: { type: 'string', maxLength: 120, layout: 'pricing-card' },
  pricingPrice: { type: 'string', maxLength: 40, layout: 'pricing-card' },
  pricingFeatures: { type: 'string', maxLength: 4000, layout: 'pricing-card' },
  contactEmail: { type: 'string', maxLength: 200, layout: 'contact-lead' },
  contactPhone: { type: 'string', maxLength: 40, layout: 'contact-lead' },
  jobTitle: { type: 'string', maxLength: 160, layout: 'careers-listing' },
  jobLocation: { type: 'string', maxLength: 120, layout: 'careers-listing' },
  policyVersion: { type: 'string', maxLength: 40, layout: 'policy-block' },
};

export const EMPTY_FOOTER_RESOURCE = {
  category: 'Documentation',
  title: '',
  content: '',
  imageurl: '',
  videourl: '',
  excerpt: '',
  sidebarOrder: 0,
  readTime: '',
  authorName: '',
  authorAvatarUrl: '',
  externalUrl: '',
  pricingLabel: '',
  pricingPrice: '',
  pricingFeatures: '',
  contactEmail: '',
  contactPhone: '',
  jobTitle: '',
  jobLocation: '',
  policyVersion: '',
};

const DOC_SIDEBAR = new Set(['Documentation', 'Guides']);
const VIDEO_GRID = new Set(['Tutorials', 'Help Center']);
const BLOG_COVER = new Set(['Blog', 'Case Studies']);
const EXTERNAL = new Set(['Community']);
const ABOUT = new Set(['About Us']);
const PRICING = new Set(['Pricing']);
const CAREERS = new Set(['Careers']);
const CONTACT = new Set(['Contact Us']);
const POLICY = new Set(['Privacy Policy', 'Terms of Service']);

export function getFooterBlock(category) {
  return FOOTER_COMPANY_CATEGORIES.includes(category) ? 'company' : 'resources';
}

export function getCategoryFieldFlags(category) {
  const isCompany = getFooterBlock(category) === 'company';
  return {
    footerBlock: getFooterBlock(category),
    showContent:
      !isCompany &&
      (DOC_SIDEBAR.has(category) || BLOG_COVER.has(category)),
    showSidebarOrder: DOC_SIDEBAR.has(category),
    showExcerpt: VIDEO_GRID.has(category) || ABOUT.has(category) || PRICING.has(category) || CONTACT.has(category) || CAREERS.has(category),
    showVideoUrl: VIDEO_GRID.has(category),
    showReadTime: BLOG_COVER.has(category),
    showAuthorName: BLOG_COVER.has(category),
    showAuthorAvatar: BLOG_COVER.has(category),
    showImageUrl: BLOG_COVER.has(category) || ABOUT.has(category),
    showExternalUrl: EXTERNAL.has(category) || CAREERS.has(category),
    showAboutBlock: ABOUT.has(category),
    showPricingCard: PRICING.has(category),
    showCareersListing: CAREERS.has(category),
    showContactLeads: CONTACT.has(category),
    showPolicyBlock: POLICY.has(category),
  };
}

const FORM_KEYS = Object.keys(EMPTY_FOOTER_RESOURCE);

export function rowToFooterForm(row = {}) {
  const form = {};
  FORM_KEYS.forEach((key) => {
    if (key === 'sidebarOrder') {
      form[key] = Number(row[key]) || 0;
      return;
    }
    form[key] = row[key] ?? '';
  });
  if (!form.category) form.category = 'Documentation';
  return form;
}
