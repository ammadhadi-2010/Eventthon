import { GUIDE_CATEGORIES, GUIDES } from '../data/guidesData';

export const GUIDE_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export const GUIDE_ICON_OPTIONS = [
  'rocket', 'user', 'users', 'trending', 'briefcase', 'folder',
  'clipboard', 'wallet', 'gift', 'card', 'building', 'globe',
];

export const GUIDE_CATEGORY_OPTIONS = GUIDE_CATEGORIES.filter((c) => c.id !== 'all');

export function serializeGuideContent({ summary = '', progress = 0 } = {}) {
  const clean = String(summary || '').trim();
  return [clean, `progress:${Math.min(100, Math.max(0, Number(progress) || 0))}`]
    .filter(Boolean)
    .join('\n');
}

export function parseGuideContent(content) {
  const text = String(content || '').trim();
  const progressMatch = text.match(/progress\s*[:=]\s*(\d{1,3})/i);
  const summary = text
    .replace(/progress\s*[:=]\s*\d{1,3}/gi, '')
    .replace(/steps\s*[:=]\s*\d{1,3}/gi, '')
    .trim();
  return {
    summary: summary && Number.isNaN(Number(summary)) ? summary : '',
    progress: Math.min(100, Math.max(0, Number(progressMatch?.[1]) || (Number(text) || 0))),
  };
}

/** Prefill admin form from a default guide template. */
export function defaultGuideFormFields(guideId = 'getting-started') {
  const guide = GUIDES.find((g) => g.id === guideId) || GUIDES[0];
  const index = Math.max(0, GUIDES.findIndex((g) => g.id === guide.id));
  return {
    title: guide.title,
    excerpt: guide.level || 'Beginner',
    readTime: guide.time || '5 min',
    pricingLabel: guide.category || 'getting-started',
    pricingPrice: String(guide.steps || 0),
    jobTitle: guide.icon || 'rocket',
    sidebarOrder: guide.featured === false ? 100 + index : index,
    content: serializeGuideContent({
      summary: guide.summary || '',
      progress: guide.progress || 0,
    }),
  };
}
