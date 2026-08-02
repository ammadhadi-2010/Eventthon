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
  'Footer Brand',
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
  contactLocation: { type: 'string', maxLength: 1000, layout: 'contact-lead' },
  contactHours: { type: 'string', maxLength: 200, layout: 'contact-lead' },
  jobTitle: { type: 'string', maxLength: 160, layout: 'careers-listing' },
  jobLocation: { type: 'string', maxLength: 120, layout: 'careers-listing' },
  policyVersion: { type: 'string', maxLength: 40, layout: 'policy-block' },
  aboutJourney: { type: 'json', maxLength: 12000, layout: 'about-journey' },
  aboutTeam: { type: 'json', maxLength: 12000, layout: 'about-team' },
  aboutFeedJourney: { type: 'string', maxLength: 1, layout: 'about-feed-flag' },
  aboutFeedTeam: { type: 'string', maxLength: 1, layout: 'about-feed-flag' },
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
  contactLocation: '',
  contactHours: '',
  jobTitle: '',
  jobLocation: '',
  policyVersion: '',
  aboutJourney: '[]',
  aboutTeam: '[]',
  aboutFeedJourney: '1',
  aboutFeedTeam: '1',
};

const DOC_SIDEBAR = new Set(['Documentation', 'Guides']);
const COMPANY_SORT = new Set(['Pricing', 'Careers']);
const RESOURCE_SORT = new Set([]);
const GUIDES = new Set(['Guides']);
const TUTORIALS_CAT = new Set(['Tutorials']);
const BLOG_CAT = new Set(['Blog']);
const CASE_STUDIES_CAT = new Set(['Case Studies']);
const HELP_CAT = new Set(['Help Center']);
const COMMUNITY_CAT = new Set(['Community']);
const BLOG_COVER = new Set([]);
const EXTERNAL = new Set([]);
const ABOUT = new Set(['About Us']);
const PRICING = new Set(['Pricing']);
const CAREERS = new Set(['Careers']);
const CONTACT = new Set(['Contact Us']);
const DOCS = new Set(['Documentation']);
const TERMS = new Set(['Terms of Service']);
const PRIVACY = new Set(['Privacy Policy']);
const FOOTER_BRAND = new Set(['Footer Brand']);

export function getFooterBlock(category) {
  return FOOTER_COMPANY_CATEGORIES.includes(category) ? 'company' : 'resources';
}

export function getCategoryFieldFlags(category) {
  const isCompany = getFooterBlock(category) === 'company';
  const isDocs = DOCS.has(category);
  const isGuides = GUIDES.has(category);
  const isTutorials = TUTORIALS_CAT.has(category);
  const isBlog = BLOG_CAT.has(category);
  const isCaseStudies = CASE_STUDIES_CAT.has(category);
  const isHelp = HELP_CAT.has(category);
  const isCommunity = COMMUNITY_CAT.has(category);
  const isFooterBrand = FOOTER_BRAND.has(category);
  return {
    footerBlock: getFooterBlock(category),
    showContent:
      !isCompany &&
      !isDocs &&
      !isGuides &&
      !isTutorials &&
      !isBlog &&
      !isCaseStudies &&
      !isHelp &&
      !isCommunity &&
      DOC_SIDEBAR.has(category),
    showSidebarOrder:
      (!isDocs && !isGuides && !isTutorials && !isBlog && !isCaseStudies && !isHelp && !isCommunity && DOC_SIDEBAR.has(category)) ||
      COMPANY_SORT.has(category) ||
      RESOURCE_SORT.has(category),
    showExcerpt:
      ABOUT.has(category) ||
      PRICING.has(category) ||
      CONTACT.has(category) ||
      CAREERS.has(category),
    showVideoUrl: false,
    showReadTime: false,
    showAuthorName: false,
    showAuthorAvatar: false,
    showImageUrl: ABOUT.has(category),
    showExternalUrl: CAREERS.has(category),
    showAboutBlock: ABOUT.has(category),
    showFooterBrand: isFooterBrand,
    showPricingCard: PRICING.has(category),
    showCareersListing: CAREERS.has(category),
    showContactLeads: CONTACT.has(category),
    showPrivacyPolicy: PRIVACY.has(category),
    showTermsOfService: TERMS.has(category),
    showDocumentation: isDocs,
    showGuides: isGuides,
    showTutorials: isTutorials,
    showBlog: isBlog,
    showCaseStudies: isCaseStudies,
    showHelpCenter: isHelp,
    showCommunity: isCommunity,
    showPolicyBlock: false,
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
    if (key === 'aboutJourney' || key === 'aboutTeam') {
      form[key] = row[key] ?? '[]';
      return;
    }
    form[key] = row[key] ?? '';
  });
  if (!form.category) form.category = 'Documentation';
  return form;
}
