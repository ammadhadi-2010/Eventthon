import { FOOTER_COMPANY_CATEGORIES } from '../../../models/FooterResource';

/** Company footer pages — same order as footer Company links (Founder's Story excluded). */
export const COMPANY_FOOTER_PAGES = [
  {
    category: 'About Us',
    route: '/company/about',
    slug: 'about',
    title: 'About Us',
    singleEntry: true,
    hint: 'One entry: About Summary, About Content, cover image, Our Journey steps, and unlimited Leadership Team members.',
  },
  {
    category: 'Pricing',
    route: '/company/pricing',
    slug: 'pricing',
    title: 'Pricing',
    singleEntry: false,
    hint: 'One row per plan. Set display order via Sort Order. Plan name, price, and features map to pricing cards.',
  },
  {
    category: 'Careers',
    route: '/company/careers',
    slug: 'careers',
    title: 'Careers',
    singleEntry: false,
    hint: 'EventThon company hiring only. One row = one role on /company/careers (e.g. Frontend Engineer → “Frontend Engineer @ EventThon”). Role Title required. Department drives filters. Apply URL optional (else careers@eventthon.com).',
  },
  {
    category: 'Contact Us',
    route: '/company/contact',
    slug: 'contact',
    title: 'Contact Us',
    singleEntry: true,
    hint: 'One entry synced to /company/contact: email, phone, location, hours, Contact Intro, and Contact Context.',
  },
  {
    category: 'Privacy Policy',
    route: '/company/privacy',
    slug: 'privacy',
    title: 'Privacy Policy',
    singleEntry: true,
    hint: 'One entry synced to /company/privacy: Last Updated, Intro, and numbered section cards (title + bullets).',
  },
  {
    category: 'Terms of Service',
    route: '/company/terms',
    slug: 'terms',
    title: 'Terms of Service',
    singleEntry: true,
    hint: 'One entry synced to /company/terms: Last Updated, Intro, and 18 numbered cards (#17–18 full-width row; #18 mailto + links).',
  },
  {
    category: 'Footer Brand',
    route: '/',
    slug: 'footer-brand',
    title: 'Footer Brand',
    singleEntry: true,
    hint: 'Left footer brand column: name, tagline, description, and EventThon social channel URLs.',
  },
];

export const COMPANY_CATEGORY_SET = new Set(FOOTER_COMPANY_CATEGORIES);

export function getCompanyPageByCategory(category) {
  return COMPANY_FOOTER_PAGES.find((p) => p.category === category) || null;
}
