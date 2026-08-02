import { TUTORIAL_CATEGORIES, TUTORIALS } from '../data/tutorialsData';

export const TUTORIAL_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export const TUTORIAL_CATEGORY_OPTIONS = TUTORIAL_CATEGORIES.filter((c) => c.id !== 'all');

export function defaultTutorialFormFields(tutorialId = 'first-squad') {
  const item = TUTORIALS.find((t) => t.id === tutorialId) || TUTORIALS[0];
  const index = Math.max(0, TUTORIALS.findIndex((t) => t.id === item.id));
  return {
    title: item.title,
    excerpt: item.level || 'Beginner',
    readTime: item.duration || '10:00',
    pricingLabel: item.category || 'getting-started',
    pricingPrice: String(item.lessons || 3),
    videourl: item.videoUrl || '',
    imageurl: item.imageurl || '',
    sidebarOrder: item.featured === false ? 100 + index : index,
    content: String(item.summary || '').trim(),
  };
}
