/** Documentation hub — topic tree + default Quick Start page. */

export const DOC_UPDATED = 'May 24, 2026';

export const DOC_NAV_GROUPS = [
  {
    id: 'product',
    label: 'Documentation',
    items: [
      { id: 'getting-started', label: 'Getting Started' },
      { id: 'account', label: 'Account Guide' },
      { id: 'profile', label: 'Profile & Verification' },
      { id: 'squads', label: 'Squads' },
      { id: 'projects', label: 'Projects' },
      { id: 'gigs', label: 'Gigs' },
      { id: 'jobs', label: 'Jobs' },
      { id: 'companies', label: 'Companies' },
      { id: 'wallet', label: 'Wallet (Thon)' },
      { id: 'payments', label: 'Payments' },
      { id: 'referrals', label: 'Referrals' },
      { id: 'donations', label: 'Donation Hub' },
    ],
  },
  {
    id: 'api',
    label: 'API Documentation',
    items: [
      { id: 'api-intro', label: 'API Introduction' },
      { id: 'auth', label: 'Authentication' },
      { id: 'endpoints', label: 'Endpoints' },
      { id: 'sdks', label: 'SDKs' },
      { id: 'webhooks', label: 'Webhooks' },
      { id: 'rate-limits', label: 'Rate Limits' },
      { id: 'errors', label: 'Error Codes' },
    ],
  },
  {
    id: 'more',
    label: 'More',
    items: [
      { id: 'dev-tools', label: 'Developer Tools' },
      { id: 'faqs', label: 'FAQs' },
      { id: 'community', label: 'Community', to: '/resources/community' },
      { id: 'changelog', label: 'Changelog' },
    ],
  },
];

export const DOC_FEATURES = [
  { id: 'squads', label: 'Squads' },
  { id: 'projects', label: 'Projects' },
  { id: 'gigs', label: 'Gigs' },
  { id: 'jobs', label: 'Jobs' },
  { id: 'wallet', label: 'Wallet Rewards' },
];

export const DOC_ACCOUNT_STEPS = [
  'Open Sign Up and choose email or Google / GitHub.',
  'Verify your email so workspace features unlock.',
  'Pick your role — creator, hire, or company hub.',
  'Land on the dashboard and explore the home feed.',
];

export const DOC_PROFILE_CHECKS = [
  'Add a clear photo and short bio',
  'List your top skills and stack',
  'Link portfolio, GitHub, or website',
  'Complete verification when prompted',
];

export const DOC_TOC = [
  { id: 'what', label: 'What is EventThon?' },
  { id: 'account-steps', label: '1. Create Your Account' },
  { id: 'profile-steps', label: '2. Build Your Profile' },
  { id: 'next', label: '3. Next Steps' },
];

export const DOC_RESOURCES = [
  { label: 'Video Tutorials', to: '/resources/tutorials' },
  { label: 'Blog', to: '/resources/blog' },
  { label: 'Help Center', to: '/resources/help' },
  { label: 'Community', to: '/resources/community' },
];

/** Flat topic pages — prose fallback when not Quick Start. */
export const DOC_PAGES = {
  'getting-started': {
    title: 'Quick Start',
    emoji: true,
    breadcrumb: ['Documentation', 'Getting Started', 'Quick Start'],
    intro: 'Create your account, set up your profile, and explore squads, gigs, jobs, and Thon rewards.',
    callout: 'This guide helps you create your account, set up your profile, and explore the platform.',
    kind: 'quickstart',
  },
  account: {
    title: 'Account Guide',
    breadcrumb: ['Documentation', 'Account Guide'],
    intro: 'Manage login, security, sessions, and workspace access for your EventThon account.',
    body: 'Use Account Settings to update email, password, and connected providers. Keep recovery options current so you never lose access to squads or wallet history.',
  },
  profile: {
    title: 'Profile & Verification',
    breadcrumb: ['Documentation', 'Profile & Verification'],
    intro: 'Build a profile that hiring companies and squads can trust.',
    body: 'Complete your overview, skills, and portfolio. Verification badges help you stand out for jobs and gigs.',
  },
  squads: {
    title: 'Squads',
    breadcrumb: ['Documentation', 'Squads'],
    intro: 'Collaborate with teammates on shared workspaces.',
    body: 'Create or join a squad, invite members, and keep projects moving with roles and activity feeds.',
  },
  projects: {
    title: 'Projects',
    breadcrumb: ['Documentation', 'Projects'],
    intro: 'Organize delivery from idea to shipped work.',
    body: 'Track milestones, attach media, and share progress with your squad or clients.',
  },
  gigs: {
    title: 'Gigs',
    breadcrumb: ['Documentation', 'Gigs'],
    intro: 'Find and deliver marketplace work on EventThon.',
    body: 'Browse open gigs, submit proposals, and manage orders through Messages and workspace tools.',
  },
  jobs: {
    title: 'Jobs',
    breadcrumb: ['Documentation', 'Jobs'],
    intro: 'Apply to roles posted by verified companies.',
    body: 'Keep your resume links and portfolio current before you apply. Track applications from your profile hub.',
  },
  companies: {
    title: 'Companies',
    breadcrumb: ['Documentation', 'Companies'],
    intro: 'Run hiring and brand presence from Company Hub.',
    body: 'Verified companies can post jobs, review applicants, and manage team access.',
  },
  wallet: {
    title: 'Wallet (Thon)',
    breadcrumb: ['Documentation', 'Wallet'],
    intro: 'Earn and track Thon rewards across the platform.',
    body: 'View balance, rewards history, and eligibility rules. Fraudulent activity may void rewards.',
  },
  payments: {
    title: 'Payments',
    breadcrumb: ['Documentation', 'Payments'],
    intro: 'Billing and payouts run through trusted providers.',
    body: 'EventThon does not store full card numbers. Review receipts and tax details in your account.',
  },
  referrals: {
    title: 'Referrals',
    breadcrumb: ['Documentation', 'Referrals'],
    intro: 'Invite friends and grow together.',
    body: 'Share your invite link from the dashboard. Rewards follow the live referral rules in-app.',
  },
  donations: {
    title: 'Donation Hub',
    breadcrumb: ['Documentation', 'Donation Hub'],
    intro: 'Support verified causes through EventThon.',
    body: 'Browse organizations and donate via trusted redirects. See /donate for the live hub.',
  },
  'api-intro': {
    title: 'API Introduction',
    breadcrumb: ['API', 'Introduction'],
    intro: 'Build on EventThon with REST-style endpoints and tokens.',
    body: 'Start with Authentication, then explore Endpoints and SDKs. Use sandbox keys while you integrate.',
    code: 'curl -X GET https://api.eventthon.com/v1/me \\\n  -H "Authorization: Bearer YOUR_TOKEN"',
  },
  auth: {
    title: 'Authentication',
    breadcrumb: ['API', 'Authentication'],
    intro: 'Authenticate with bearer tokens from your developer settings.',
    body: 'Never expose tokens in client-side public repos. Rotate keys if a leak is suspected.',
    code: 'Authorization: Bearer et_live_xxx',
  },
  endpoints: {
    title: 'Endpoints',
    breadcrumb: ['API', 'Endpoints'],
    intro: 'Core resources for projects, gigs, and profiles.',
    body: 'Use pagination query params (limit, cursor) on list routes. Errors return structured JSON codes.',
    code: 'GET /v1/projects?status=active&limit=20',
  },
  sdks: {
    title: 'SDKs',
    breadcrumb: ['API', 'SDKs'],
    intro: 'Official helpers for JavaScript integrations.',
    body: 'Install the SDK, pass your token, and call high-level helpers instead of raw fetch.',
    code: "import { EventThon } from '@eventthon/sdk';\nconst client = new EventThon({ token: process.env.ET_TOKEN });",
  },
  webhooks: {
    title: 'Webhooks',
    breadcrumb: ['API', 'Webhooks'],
    intro: 'Receive event callbacks for orders, jobs, and wallet updates.',
    body: 'Verify signatures on every request. Retry safely with idempotent handlers.',
  },
  'rate-limits': {
    title: 'Rate Limits',
    breadcrumb: ['API', 'Rate Limits'],
    intro: 'Stay within fair-use limits for stable integrations.',
    body: 'Respect Retry-After headers. Burst traffic may be throttled temporarily.',
  },
  errors: {
    title: 'Error Codes',
    breadcrumb: ['API', 'Error Codes'],
    intro: 'Common API error shapes and how to handle them.',
    body: '4xx means client input or auth issues. 5xx means retry with backoff and report if persistent.',
  },
  'dev-tools': {
    title: 'Developer Tools',
    breadcrumb: ['More', 'Developer Tools'],
    intro: 'Utilities that speed up debugging and sandbox testing.',
    body: 'Use request logs, webhook inspectors, and token scopes from your developer portal settings.',
  },
  faqs: {
    title: 'FAQs',
    breadcrumb: ['More', 'FAQs'],
    intro: 'Short answers to common documentation questions.',
    body: 'For account recovery, billing, or disputes, open Help Center or Contact Support.',
  },
  changelog: {
    title: 'Changelog',
    breadcrumb: ['More', 'Changelog'],
    intro: 'Notable platform and API updates.',
    body: 'Material changes to Terms, Privacy, or API behavior are announced in-app and noted here over time.',
  },
};

/** Legacy exports for older mapper / imports. */
export const DOC_NAV = DOC_NAV_GROUPS.flatMap((g) => g.items).map(({ id, label }) => ({ id, label }));

export const DOC_SNIPPETS = Object.fromEntries(
  Object.entries(DOC_PAGES).map(([id, page]) => [
    id,
    {
      title: page.title,
      prose: page.body || page.intro || '',
      code: page.code || '',
    },
  ]),
);
