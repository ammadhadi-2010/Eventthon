/** View-all routes (AppRoutes redirects /networks and /events when needed). */
export const DASHBOARD_SIDEBAR_ROUTES = {
  squads: '/squads',
  people: '/networks',
  projects: '/squads',
  events: '/events',
};

export const SUGGESTED_SQUADS = [
  { id: 'sq-seo', title: 'SEO Masters', category: 'Marketing Squad', color: '#3b82f6', members: 128 },
  { id: 'sq-react', title: 'React Builders', category: 'Development Squad', color: '#8b5cf6', members: 96 },
  { id: 'sq-design', title: 'UI Collective', category: 'Design Squad', color: '#06b6d4', members: 74 },
];

export const PEOPLE_SUGGESTIONS = [
  { id: 'p-sarah', name: 'Sarah Khan', role: 'UI/UX Designer', mutual: 12 },
  { id: 'p-usman', name: 'Usman Ali', role: 'Full Stack Developer', mutual: 8 },
  { id: 'p-hira', name: 'Hira Saeed', role: 'Product Manager', mutual: 5 },
  { id: 'p-bilal', name: 'Bilal Ahmed', role: 'DevOps Engineer', mutual: 3 },
];

export const TRENDING_PROJECTS = [
  { id: 'tp-ai', title: 'AI SaaS Platform', tag: 'Hot', path: '/squads' },
  { id: 'tp-shop', title: 'Shopify Automation', tag: 'Trending', path: '/squads' },
  { id: 'tp-mobile', title: 'Flutter Fitness App', tag: 'New', path: '/squads' },
];

export const UPCOMING_EVENTS = [
  { id: 'ev-hack', title: 'Global Hackathon 2026', when: 'Mar 28, 2026', path: '/events' },
  { id: 'ev-meet', title: 'Freelancer Networking Night', when: 'Apr 5, 2026', path: '/events' },
];
