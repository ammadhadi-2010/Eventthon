import {
  FiAward,
  FiBarChart2,
  FiBriefcase,
  FiFolder,
  FiGlobe,
  FiHeadphones,
  FiLayers,
  FiLock,
  FiMail,
  FiUsers,
  FiZap,
} from 'react-icons/fi';

export const FOOTER_TAGLINE = 'Connect. Collaborate. Create Impact.';

export const FOOTER_DESCRIPTION =
  'The all-in-one platform for squads, projects, and collaborations. Build, innovate and deliver impactful solutions together.';

export const FOOTER_SOCIAL = [
  { id: 'facebook', label: 'Facebook', href: 'https://facebook.com' },
  { id: 'x', label: 'X', href: 'https://x.com' },
  { id: 'linkedin', label: 'LinkedIn', href: 'https://linkedin.com' },
  { id: 'discord', label: 'Discord', href: 'https://discord.com' },
  { id: 'youtube', label: 'YouTube', href: 'https://youtube.com' },
];

export const FOOTER_NAV = [
  {
    id: 'resources',
    title: 'Resources',
    icon: FiLayers,
    links: [
      { label: 'Documentation', to: '/resources/documentation' },
      { label: 'Guides', to: '/resources/guides' },
      { label: 'Tutorials', to: '/resources/tutorials' },
      { label: 'Rank Matrix', action: 'rank-matrix' },
      { label: 'Blog', to: '/resources/blog' },
      { label: 'Case Studies', to: '/resources/case-studies' },
      { label: 'Help Center', to: '/resources/help' },
      { label: 'Community', to: '/resources/community' },
    ],
  },
  {
    id: 'company',
    title: 'Company',
    icon: FiUsers,
    links: [
      { label: 'About Us', to: '/company/about' },
      { label: "Founder's Story", to: '/founders-story' },
      { label: 'Pricing', to: '/company/pricing' },
      { label: 'Careers', to: '/company/careers' },
      { label: 'Contact Us', to: '/company/contact' },
      { label: 'Privacy Policy', to: '/company/privacy' },
      { label: 'Terms of Service', to: '/company/terms' },
    ],
  },
];

export const FOOTER_NEWSLETTER_CHECKS = [
  'Weekly platform updates',
  'Exclusive tips & resources',
  'No spam. Unsubscribe anytime.',
];

export const FOOTER_STATS = [
  { id: 'users', value: '25K+', label: 'Active Users', icon: FiUsers, tone: 'violet' },
  { id: 'squads', value: '4.8K+', label: 'Active Squads', icon: FiUsers, tone: 'blue' },
  { id: 'projects', value: '12K+', label: 'Projects Created', icon: FiFolder, tone: 'violet' },
  { id: 'gigs', value: '8.6K+', label: 'Gigs Posted', icon: FiBriefcase, tone: 'blue' },
  { id: 'satisfaction', value: '98%', label: 'Satisfaction Rate', icon: FiAward, tone: 'pink' },
];

export const FOOTER_VALUES = [
  { id: 'secure', title: 'Trusted & Secure', text: 'Your data is safe with enterprise-grade security.', icon: FiLock, tone: 'violet' },
  { id: 'fast', title: 'Fast & Reliable', text: 'Optimized for speed and built for reliability.', icon: FiZap, tone: 'blue' },
  { id: 'collab', title: 'Built for Collaboration', text: 'Everything you need to work together in one place.', icon: FiUsers, tone: 'violet' },
  { id: 'data', title: 'Data Driven', text: 'Make smarter decisions with real-time insights.', icon: FiBarChart2, tone: 'blue' },
  { id: 'global', title: 'Global Community', text: 'Join a community of innovators worldwide.', icon: FiGlobe, tone: 'pink' },
  { id: 'support', title: '24/7 Support', text: 'Our team is here to help whenever you need us.', icon: FiHeadphones, tone: 'blue' },
];

export const FOOTER_PAYMENTS = ['Visa', 'Mastercard', 'PayPal', 'Stripe', 'Apple Pay', 'Google Pay'];

export const FOOTER_NEWSLETTER_ICON = FiMail;
