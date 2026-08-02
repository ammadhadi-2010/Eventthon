/** Community Hub — mockup defaults for /resources/community */

export const COMMUNITY_SUBTITLE = 'Connect, learn and grow with the EventThon community.';

export const COMMUNITY_NAV = [
  { id: 'overview', label: 'Overview', icon: 'home' },
  { id: 'discussions', label: 'Discussions', icon: 'chat' },
  { id: 'members', label: 'Members', icon: 'users' },
  { id: 'events', label: 'Events', icon: 'calendar' },
  { id: 'leaderboard', label: 'Leaderboard', icon: 'award' },
  { id: 'announcements', label: 'Announcements', icon: 'volume' },
  { id: 'guides', label: 'Community Guides', icon: 'book' },
  { id: 'ideas', label: 'Ideas Board', icon: 'idea' },
];

export const COMMUNITY_STATS = [
  { id: 'members', label: 'Total Members', value: '15,892' },
  { id: 'online', label: 'Online Now', value: '342', online: true },
  { id: 'discussions', label: 'Discussions', value: '2,451' },
  { id: 'posts', label: 'Posts', value: '18,760' },
  { id: 'solutions', label: 'Solutions', value: '1,097' },
];

export const COMMUNITY_ACTIONS = [
  {
    id: 'ask',
    title: 'Ask the Community',
    text: 'Get answers from experienced members',
    cta: 'Ask Now →',
    tone: 'violet',
    icon: 'help',
    to: '/company/contact',
  },
  {
    id: 'share',
    title: 'Share Knowledge',
    text: 'Help others by sharing tips',
    cta: 'Share →',
    tone: 'green',
    icon: 'share',
    to: '/resources/guides',
  },
  {
    id: 'opps',
    title: 'Find Opportunities',
    text: 'Discover gigs, jobs & collabs',
    cta: 'Explore →',
    tone: 'orange',
    icon: 'briefcase',
    to: '/gigs',
  },
  {
    id: 'network',
    title: 'Grow Your Network',
    text: 'Connect with creators & companies',
    cta: 'Connect →',
    tone: 'blue',
    icon: 'users',
    to: '/squads',
  },
];

export const FEATURED_DISCUSSIONS = [
  {
    id: 'welcome',
    title: 'Welcome to EventThon Community!',
    summary: 'Introduce yourself and meet fellow creators.',
    replies: 245,
    icon: 'volume',
    tone: 'violet',
    avatars: [
      'https://api.dicebear.com/8.x/avataaars/svg?seed=Ayesha',
      'https://api.dicebear.com/8.x/avataaars/svg?seed=Omar',
      'https://api.dicebear.com/8.x/avataaars/svg?seed=Sara',
    ],
  },
  {
    id: 'roadmap',
    title: 'Product Roadmap 2026',
    summary: 'Upcoming features and platform updates.',
    replies: 189,
    icon: 'zap',
    tone: 'blue',
    avatars: [
      'https://api.dicebear.com/8.x/avataaars/svg?seed=Bilal',
      'https://api.dicebear.com/8.x/avataaars/svg?seed=Hina',
      'https://api.dicebear.com/8.x/avataaars/svg?seed=Dev',
    ],
  },
  {
    id: 'success',
    title: 'Success Stories',
    summary: 'Share your wins and inspire others.',
    replies: 312,
    icon: 'star',
    tone: 'amber',
    avatars: [
      'https://api.dicebear.com/8.x/avataaars/svg?seed=Nina',
      'https://api.dicebear.com/8.x/avataaars/svg?seed=Ali',
      'https://api.dicebear.com/8.x/avataaars/svg?seed=Maya',
    ],
  },
  {
    id: 'contests',
    title: 'Community Contests',
    summary: 'Join challenges and win rewards.',
    replies: 156,
    icon: 'award',
    tone: 'green',
    avatars: [
      'https://api.dicebear.com/8.x/avataaars/svg?seed=Zara',
      'https://api.dicebear.com/8.x/avataaars/svg?seed=Hassan',
      'https://api.dicebear.com/8.x/avataaars/svg?seed=Noor',
    ],
  },
];

export const COMMUNITY_CATEGORIES = [
  { id: 'freelancers', label: 'Freelancers', members: '1.2K Members', icon: 'briefcase', tone: 'violet' },
  { id: 'startups', label: 'Startups', members: '890 Members', icon: 'zap', tone: 'blue' },
  { id: 'developers', label: 'Developers', members: '2.4K Members', icon: 'code', tone: 'cyan' },
  { id: 'designers', label: 'Designers', members: '1.1K Members', icon: 'pen', tone: 'pink' },
  { id: 'marketing', label: 'Marketing', members: '760 Members', icon: 'target', tone: 'orange' },
  { id: 'ai', label: 'AI & Tech', members: '1.8K Members', icon: 'cpu', tone: 'green' },
];

export const TRENDING_TOPICS = [
  { id: 't1', title: 'How to get your first gig?', replies: 89 },
  { id: 't2', title: 'Best tools for remote teams', replies: 67 },
  { id: 't3', title: 'Pricing strategies for freelancers', replies: 54 },
  { id: 't4', title: 'Building a personal brand', replies: 48 },
  { id: 't5', title: 'AI tools every creator should know', replies: 41 },
];

export const UPCOMING_EVENTS = [
  {
    id: 'e1',
    title: 'Live Webinar: Growing on EventThon',
    when: 'Tomorrow · 6:00 PM',
    cta: 'Register',
    icon: 'calendar',
    tone: 'violet',
  },
  {
    id: 'e2',
    title: 'AMA with Top Creators',
    when: 'Fri · 8:00 PM',
    cta: 'Join Now',
    icon: 'mic',
    tone: 'blue',
  },
  {
    id: 'e3',
    title: 'Community Challenge Kickoff',
    when: 'Sat · 4:00 PM',
    cta: 'Join Now',
    icon: 'award',
    tone: 'amber',
  },
];

export const TOP_MEMBERS = [
  {
    id: 'm1',
    name: 'Ayesha Khan',
    role: 'Top Contributor',
    points: 4820,
    medal: 'gold',
    initial: 'A',
    avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=Ayesha%20Khan',
  },
  {
    id: 'm2',
    name: 'Omar Farooq',
    role: 'Rising Star',
    points: 4510,
    medal: 'silver',
    initial: 'O',
    avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=Omar%20Farooq',
  },
  {
    id: 'm3',
    name: 'Sara Ali',
    role: 'Help Hero',
    points: 4205,
    medal: 'bronze',
    initial: 'S',
    avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=Sara%20Ali',
  },
  {
    id: 'm4',
    name: 'Bilal Ahmed',
    role: 'Active Member',
    points: 3890,
    medal: '',
    initial: 'B',
    avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=Bilal%20Ahmed',
  },
  {
    id: 'm5',
    name: 'Hina Raza',
    role: 'Mentor',
    points: 3650,
    medal: '',
    initial: 'H',
    avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=Hina%20Raza',
  },
];

export const COMMUNITY_HIGHLIGHTS = [
  { id: 'h1', label: 'Be Respectful', icon: 'heart' },
  { id: 'h2', label: 'Be Helpful', icon: 'check' },
  { id: 'h3', label: 'No Spam', icon: 'shield' },
  { id: 'h4', label: 'Report Issues', icon: 'flag' },
];

export const COMMUNITY_FOOTER_STATS = [
  { id: 'f1', label: 'Active Members', value: '342 online now', icon: 'users' },
  { id: 'f2', label: 'Discussions Today', value: '89 new discussions', icon: 'chat' },
  { id: 'f3', label: 'Solutions Provided', value: '145 solutions today', icon: 'check' },
  { id: 'f4', label: 'Countries', value: '120+ countries', icon: 'globe' },
];

/** Legacy CMS fallbacks */
export const LEADERBOARD = TOP_MEMBERS.map((m, i) => ({
  rank: i + 1,
  name: m.name,
  points: m.points,
}));

export const THREADS = FEATURED_DISCUSSIONS.map((d) => ({
  id: d.id,
  title: d.title,
  replies: d.replies,
  ago: 'Pinned',
}));

export const EVENT_COUNTDOWN = { label: 'Live Webinar: Growing on EventThon', days: 1, hours: 18 };
