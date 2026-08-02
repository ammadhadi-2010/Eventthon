/** Help Center hub — categories, featured articles, FAQ (CMS fallback). */

export const HELP_SUBTITLE =
  'Find answers for account, squads, gigs, wallet, and more.';

export const HELP_CATEGORIES = [
  { id: 'getting-started', label: 'Getting Started', icon: 'zap', to: '/resources/documentation' },
  { id: 'account', label: 'Account', icon: 'user', to: '/dashboard/account' },
  { id: 'squads', label: 'Squads', icon: 'users', to: '/squads' },
  { id: 'jobs', label: 'Jobs Hub', icon: 'briefcase', to: '/jobs' },
  { id: 'gigs', label: 'Gigs', icon: 'target', to: '/gigs' },
  { id: 'projects', label: 'Projects', icon: 'folder', to: '/projects' },
  { id: 'companies', label: 'Company Pages', icon: 'building', to: '/company-hub' },
  { id: 'wallet', label: 'Wallet & Thon', icon: 'wallet', to: '/wallet' },
  { id: 'payments', label: 'Payments', icon: 'card', to: '/wallet' },
  { id: 'verification', label: 'Verification', icon: 'shield', to: '/dashboard/account' },
  { id: 'safety', label: 'Safety & Security', icon: 'lock', to: '/company/privacy' },
  { id: 'reports', label: 'Report User', icon: 'flag', to: '/company/contact' },
  { id: 'donation', label: 'Donation Hub', icon: 'heart', to: '/donate' },
  { id: 'settings', label: 'Settings', icon: 'settings', to: '/dashboard/account' },
  { id: 'policies', label: 'Privacy & Terms', icon: 'file', to: '/company/privacy' },
  { id: 'bugs', label: 'Bugs', icon: 'bug', to: '/company/contact' },
  { id: 'features', label: 'Feature Requests', icon: 'bulb', to: '/company/contact' },
];

export const FEATURED_ARTICLES = [
  {
    id: 'how-eventthon-works',
    title: 'How EventThon Works',
    category: 'getting-started',
    summary: 'Squads, gigs, jobs, wallet, and company tools in one workspace.',
    body: 'EventThon Network brings creators and companies together. Start with your profile, explore the home feed, then join a squad or publish a gig. Wallet tracks Thon rewards while Jobs and Company Hub handle hiring.',
  },
  {
    id: 'verify-profile',
    title: 'Verify Your Profile',
    category: 'verification',
    summary: 'Unlock hiring, payouts, and trusted marketplace access.',
    body: 'Open Account Settings → Verification. Complete identity checks and wait for approval. Verified accounts unlock payouts, company tools, and higher trust signals.',
  },
  {
    id: 'first-gig',
    title: 'Create Your First Gig',
    category: 'gigs',
    summary: 'Draft scope, set pricing, and go live on the marketplace.',
    body: 'Open Gigs → Create. Write a clear scope, set milestones or fixed price, then publish. Strong proposals and on-time delivery improve your ranking.',
  },
  {
    id: 'build-squad',
    title: 'Build Your Squad',
    category: 'squads',
    summary: 'Invite members, assign roles, and ship together.',
    body: 'Create a squad from Squads, invite teammates, and set roles. Use projects and chat to keep delivery aligned.',
  },
  {
    id: 'company-page',
    title: 'Create Company Page',
    category: 'companies',
    summary: 'Switch into Company Hub and publish your hiring presence.',
    body: 'Open Company Hub, complete company details, then post roles. Team admins control access and applications.',
  },
  {
    id: 'wallet-thon',
    title: 'Wallet & Thon',
    category: 'wallet',
    summary: 'Track balance, rewards, and transaction history safely.',
    body: 'Wallet shows Thon balance, rewards eligibility, and history. Keep verification current before withdrawing.',
  },
  {
    id: 'withdraw',
    title: 'Withdraw Earnings',
    category: 'payments',
    summary: 'Link payout methods and withdraw after verification.',
    body: 'Add a payout method in Wallet, confirm verification, then request a withdrawal. Processing times depend on the provider.',
  },
];

export const FAQ_ITEMS = [
  { q: 'Forgot Password?', a: 'Use Forgot Password on the login page, or reset from Account Settings while signed in.', category: 'account' },
  { q: 'Why is my account restricted?', a: 'Restrictions usually follow trust & safety reviews. Check Alerts or contact Support with your email.', category: 'safety' },
  { q: 'How to verify a company?', a: 'Open Company Hub → Verification and submit business documents for review.', category: 'companies' },
  { q: 'How do payouts work?', a: 'Earnings settle in Wallet. After verification, withdraw via your linked payout method.', category: 'payments' },
  { q: 'How do I reset my password?', a: 'Go to Auth settings or use the forgot password link on the login page.', category: 'account' },
  { q: 'Can I export project data?', a: 'Yes. Open Projects → Reports and use the export action on any table row.', category: 'projects' },
];

export const HELP_STATUS = [
  { id: 'api', label: 'API', online: true },
  { id: 'wallet', label: 'Wallet', online: true },
  { id: 'jobs', label: 'Jobs', online: true },
  { id: 'messaging', label: 'Messaging', online: true },
];

export const HELP_ASSIST = [
  { id: 'contact', label: 'Contact Support', to: '/company/contact', icon: 'headphones' },
  { id: 'chat', label: 'Live Chat', to: '/messages', icon: 'message' },
  { id: 'email', label: 'Email Support', to: 'mailto:support@eventthon.com?subject=Help%20Center', icon: 'mail' },
  { id: 'docs', label: 'Documentation', to: '/resources/documentation', icon: 'book' },
  { id: 'tutorials', label: 'Tutorials', to: '/resources/tutorials', icon: 'play' },
  { id: 'community', label: 'Community Forum', to: '/resources/community', icon: 'globe' },
  { id: 'bug', label: 'Report Bug', to: '/company/contact', icon: 'bug' },
  { id: 'feature', label: 'Suggest Feature', to: '/company/contact', icon: 'bulb' },
  { id: 'donate', label: 'Donation Hub', to: '/donate', icon: 'heart' },
];

/** @deprecated older imports */
export const heroTitle = 'How can we help you?';
