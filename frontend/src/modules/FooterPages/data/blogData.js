/** Blog hub — posts grid (CMS fallback). */

export const BLOG_SUBTITLE =
  'Insights, stories, and guides to help you grow with EventThon.';

export const BLOG_CATEGORIES = [
  { id: 'all', label: 'All Posts' },
  { id: 'platform-updates', label: 'Platform Updates' },
  { id: 'business', label: 'Business' },
  { id: 'freelancing', label: 'Freelancing' },
  { id: 'success-stories', label: 'Success Stories' },
  { id: 'tips-guides', label: 'Tips & Guides' },
  { id: 'tech', label: 'Tech' },
  { id: 'community', label: 'Community' },
];

export const BLOG_POSTS = [
  {
    id: 'roadmap-2026',
    title: "EventThon Roadmap 2026: What's Coming Next",
    summary: 'A look at squads, gigs, jobs, wallet rewards, and the features shipping next.',
    category: 'platform-updates',
    categoryLabel: 'Platform Updates',
    author: 'Hadia Emaan',
    date: 'May 18, 2026',
    readTime: '6 min read',
    imageurl: '',
    authorAvatar: '',
  },
  {
    id: 'thon-rewards',
    title: 'How Thon Rewards Work',
    summary: 'Earn, track, and redeem Thon across gigs, referrals, and daily activity.',
    category: 'tips-guides',
    categoryLabel: 'Tips & Guides',
    author: 'Aisha Khan',
    date: 'May 16, 2026',
    readTime: '5 min read',
    imageurl: '',
    authorAvatar: '',
  },
  {
    id: 'verify-account',
    title: 'How to Verify Your Account',
    summary: 'Step-by-step verification so you can unlock hiring, payouts, and company tools.',
    category: 'platform-updates',
    categoryLabel: 'Platform Updates',
    author: 'Omar Ali',
    date: 'May 14, 2026',
    readTime: '4 min read',
    imageurl: '',
    authorAvatar: '',
  },
  {
    id: 'freelance-gigs',
    title: 'Winning Your First Gig on EventThon',
    summary: 'Proposal tips, scope clarity, and delivery habits that clients trust.',
    category: 'freelancing',
    categoryLabel: 'Freelancing',
    author: 'Nina Patel',
    date: 'May 12, 2026',
    readTime: '7 min read',
    imageurl: '',
    authorAvatar: '',
  },
  {
    id: 'squad-success',
    title: 'From Solo to Squad: A Creator Story',
    summary: 'How one team scaled collaboration with squads, roles, and shared projects.',
    category: 'success-stories',
    categoryLabel: 'Success Stories',
    author: 'James Lee',
    date: 'May 10, 2026',
    readTime: '8 min read',
    imageurl: '',
    authorAvatar: '',
  },
  {
    id: 'company-hub',
    title: 'Company Hub for Hiring Managers',
    summary: 'Post roles, review applicants, and keep hiring workflows inside EventThon.',
    category: 'business',
    categoryLabel: 'Business',
    author: 'Sara Malik',
    date: 'May 8, 2026',
    readTime: '6 min read',
    imageurl: '',
    authorAvatar: '',
  },
];

/** @deprecated kept for older imports — use BLOG_POSTS[0] */
export const FEATURED_POST = {
  title: BLOG_POSTS[0].title,
  author: BLOG_POSTS[0].author,
  category: BLOG_POSTS[0].categoryLabel,
  date: BLOG_POSTS[0].date,
  excerpt: BLOG_POSTS[0].summary,
};

export const POPULAR_POSTS = [
  { id: 'thon-rewards', title: 'How Thon Rewards Work', meta: '5 min · Tips & Guides' },
  { id: 'verify-account', title: 'How to Verify Your Account', meta: '4 min · Platform Updates' },
  { id: 'roadmap-2026', title: "EventThon Roadmap 2026", meta: '6 min · Platform Updates' },
  { id: 'freelance-gigs', title: 'Winning Your First Gig', meta: '7 min · Freelancing' },
  { id: 'squad-success', title: 'From Solo to Squad', meta: '8 min · Success Stories' },
];
