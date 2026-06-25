import { COMMENT_LOTTIE_URLS } from './commentLottiePool';

export const STICKER_CATEGORIES = [
  { id: 'tech', label: 'Tech' },
  { id: 'management', label: 'Management' },
  { id: 'strategy', label: 'Strategy' },
  { id: 'win', label: 'Win' },
];

const DEFINITIONS = [
  { id: 'coding', label: 'Coding', category: 'tech' },
  { id: 'debugging', label: 'Debugging', category: 'tech' },
  { id: 'code-review', label: 'Code Review', category: 'tech' },
  { id: 'deploy', label: 'Deploying', category: 'tech' },
  { id: 'api-build', label: 'API Build', category: 'tech' },
  { id: 'database', label: 'Database', category: 'tech' },
  { id: 'ui-build', label: 'UI Build', category: 'tech' },
  { id: 'pair-program', label: 'Pair Programming', category: 'tech' },
  { id: 'meeting', label: 'Team Meeting', category: 'management' },
  { id: 'standup', label: 'Daily Standup', category: 'management' },
  { id: 'sprint-plan', label: 'Sprint Planning', category: 'management' },
  { id: 'reviewing', label: 'Reviewing', category: 'management' },
  { id: 'delegating', label: 'Delegating', category: 'management' },
  { id: 'timeline', label: 'Timeline Sync', category: 'management' },
  { id: 'coffee-break', label: 'Coffee Break', category: 'management' },
  { id: 'busy', label: 'Heads Down', category: 'management' },
  { id: 'roadmap', label: 'Roadmap', category: 'strategy' },
  { id: 'analytics', label: 'Analytics', category: 'strategy' },
  { id: 'growth', label: 'Growth Focus', category: 'strategy' },
  { id: 'contract', label: 'Contract Signed', category: 'strategy' },
  { id: 'pitch', label: 'Pitch Deck', category: 'strategy' },
  { id: 'research', label: 'User Research', category: 'strategy' },
  { id: 'budget', label: 'Budget Planning', category: 'strategy' },
  { id: 'focus', label: 'Deep Focus', category: 'strategy' },
  { id: 'milestone', label: 'Milestone Met', category: 'win' },
  { id: 'celebrating', label: 'Celebrating', category: 'win' },
  { id: 'promotion', label: 'Promotion', category: 'win' },
  { id: 'launch', label: 'Product Launch', category: 'win' },
  { id: 'trophy', label: 'Top Performer', category: 'win' },
  { id: 'deal-closed', label: 'Deal Closed', category: 'win' },
  { id: 'kudos', label: 'Team Kudos', category: 'win' },
  { id: 'goal-hit', label: 'Goal Achieved', category: 'win' },
];

/** 32 professional working stickers with category metadata. */
export const WORKING_STICKERS = DEFINITIONS.map((item, index) => ({
  ...item,
  src: COMMENT_LOTTIE_URLS[index % COMMENT_LOTTIE_URLS.length],
}));

export function getStickersByCategory(categoryId) {
  if (!categoryId) return WORKING_STICKERS;
  return WORKING_STICKERS.filter((s) => s.category === categoryId);
}
