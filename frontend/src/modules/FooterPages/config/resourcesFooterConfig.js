import { FOOTER_RESOURCE_CATEGORIES } from '../../../models/FooterResource';

/** Resources footer pages — footer order (Rank Matrix is in-app action, not CMS). */
export const RESOURCES_FOOTER_PAGES = [
  {
    category: 'Documentation',
    route: '/resources/documentation',
    slug: 'documentation',
    title: 'Documentation',
    singleEntry: false,
    hint: 'One row per docs topic. Pick Topic (e.g. Getting Started / API Introduction). Quick Start = callout + steps + checks. Other topics = intro + body + code. Live on /resources/documentation.',
  },
  {
    category: 'Guides',
    route: '/resources/guides',
    slug: 'guides',
    title: 'Guides',
    singleEntry: false,
    hint: 'One row = one guide on /resources/guides. Title, summary, level, category, steps, progress %, icon, Featured (sort &lt; 100). Load template for starter cards.',
  },
  {
    category: 'Tutorials',
    route: '/resources/tutorials',
    slug: 'tutorials',
    title: 'Tutorials',
    singleEntry: false,
    hint: 'One row = one video on /resources/tutorials. Title, summary, level, duration, lessons, category, video URL, thumbnail, Featured (sort &lt; 100). Load template for starter cards.',
  },
  {
    category: 'Blog',
    route: '/resources/blog',
    slug: 'blog',
    title: 'Blog',
    singleEntry: false,
    hint: 'Write posts for /resources/blog. Title, card summary, article body, category, author, date, read time, cover. Prefer Admin → Blog Management.',
  },
  {
    category: 'Case Studies',
    route: '/resources/case-studies',
    slug: 'case-studies',
    title: 'Case Studies',
    singleEntry: false,
    hint: 'Success stories for /resources/case-studies. Title, summary, up to 3 metrics, category, author, cover. Order 0 = Featured. Prefer Admin → Case Studies.',
  },
  {
    category: 'Help Center',
    route: '/resources/help',
    slug: 'help',
    title: 'Help Center',
    singleEntry: true,
    hint: 'One entry for /resources/help. Hero title + ## categories / ## featured / ## faq / ## status pipe sections. Prefer Admin → Help Center Management.',
  },
  {
    category: 'Community',
    route: '/resources/community',
    slug: 'community',
    title: 'Community',
    singleEntry: true,
    hint: 'One entry for /resources/community. Discord URL + ## actions / discussions / categories / trending / events / members / stats. Prefer Admin → Community Management.',
  },
];

export const RESOURCES_CATEGORY_SET = new Set(FOOTER_RESOURCE_CATEGORIES);

export function getResourcesPageByCategory(category) {
  return RESOURCES_FOOTER_PAGES.find((p) => p.category === category) || null;
}
