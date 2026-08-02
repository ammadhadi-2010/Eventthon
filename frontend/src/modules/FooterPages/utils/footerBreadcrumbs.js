import { COMPANY_FOOTER_PAGES } from '../config/companyFooterConfig';
import { RESOURCES_FOOTER_PAGES } from '../config/resourcesFooterConfig';

const FOOTER = { label: 'Footer', to: '#site-footer' };
const RESOURCES_HUB = { label: 'Resources', to: '/resources/documentation' };
const COMPANY_HUB = { label: 'Company', to: '/company/about' };

function matchPage(pages, pathname) {
  return pages.find((p) => pathname === p.route || pathname.startsWith(`${p.route}/`)) || null;
}

/** Auto trail: Footer / Resources|Company / Page */
export function buildFooterCrumbs(pathname = '') {
  const path = String(pathname || '').replace(/\/$/, '') || '/';

  if (path.startsWith('/resources')) {
    const page = matchPage(RESOURCES_FOOTER_PAGES, path);
    const trail = [FOOTER, RESOURCES_HUB];
    if (page) trail.push({ label: page.title, to: page.route });
    return trail;
  }

  if (path.startsWith('/company')) {
    const page = matchPage(COMPANY_FOOTER_PAGES, path);
    const trail = [FOOTER, COMPANY_HUB];
    if (page) trail.push({ label: page.title, to: page.route });
    return trail;
  }

  if (path === '/founders-story') {
    return [FOOTER, COMPANY_HUB, { label: "Founder's Story", to: '/founders-story' }];
  }

  if (path === '/donate' || path.startsWith('/donate')) {
    const trail = [FOOTER, RESOURCES_HUB, { label: 'Donate', to: '/donate' }];
    if (path.includes('learn-more')) {
      trail.push({ label: 'Learn More' });
    }
    return trail;
  }

  return [FOOTER];
}

/** Docs hub trail including topic + optional leaf (e.g. Quick Start). */
export function buildDocsCrumbs(topicId, page) {
  const docs = { label: 'Documentation', to: '/resources/documentation' };
  const trail = [FOOTER, RESOURCES_HUB, docs];

  if (!page) return trail;

  const topicLabel =
    topicId === 'getting-started'
      ? 'Getting Started'
      : page.title || topicId;

  trail.push({
    label: topicLabel,
    to: `/resources/documentation?topic=${encodeURIComponent(topicId || 'getting-started')}`,
  });

  if (page.kind === 'quickstart') {
    trail.push({ label: 'Quick Start' });
  }

  return trail;
}
