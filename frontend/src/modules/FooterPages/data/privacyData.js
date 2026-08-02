/** Default Privacy Policy sections — EventThon Network (public CMS fallback). */

export const PRIVACY_INTRO =
  'Welcome to EventThon Network. This Privacy Policy explains how we collect, use, store, and protect your information when you use our platform for squads, projects, gigs, jobs, wallets, and donations.';

export const PRIVACY_LAST_UPDATED = 'May 24, 2026';

export const PRIVACY_SECTIONS = [
  {
    id: 'collect',
    label: 'Information We Collect',
    bullets: ['Name & username', 'Email address', 'Profile photo', 'Wallet activity', 'IP address & device data', 'Usage analytics'],
  },
  {
    id: 'use',
    label: 'How We Use Your Information',
    bullets: ['Create and secure accounts', 'Improve platform features', 'Process payments & Thon', 'Respond to support requests', 'Prevent fraud and abuse'],
  },
  {
    id: 'public-profile',
    label: 'Public Profile',
    bullets: ['Name, bio, and skills', 'Public badges & ranks', 'Portfolio / projects you share', 'Activity you choose to make public'],
  },
  {
    id: 'payment',
    label: 'Payment Information',
    bullets: ['Payments via trusted providers', 'We do not store full card numbers', 'Billing metadata for receipts', 'Refunds handled per provider rules'],
  },
  {
    id: 'wallet',
    label: 'Wallet & Thon Rewards',
    bullets: ['Thon balance & rewards', 'Deposit / withdraw history', 'Transaction records', 'Fraud monitoring signals'],
  },
  {
    id: 'jobs',
    label: 'Job & Hiring Data',
    bullets: ['Resume & portfolio links', 'Cover letters', 'Application history', 'Interview notes you submit'],
  },
  {
    id: 'company',
    label: 'Company Accounts',
    bullets: ['Verified companies may view applicants', 'Hiring context only', 'Company admins control access', 'You can withdraw applications'],
  },
  {
    id: 'cookies',
    label: 'Cookies',
    bullets: ['Keep you signed in', 'Remember preferences', 'Analyze traffic safely', 'Improve performance'],
  },
  {
    id: 'security',
    label: 'Security',
    bullets: ['HTTPS encryption', 'Password hashing', 'Secure authentication', 'Access controls & monitoring'],
  },
  {
    id: 'sharing',
    label: 'Data Sharing',
    bullets: ['We never sell personal data', 'Shared with verified employers when you apply', 'Payment & cloud processors', 'Legal requests when required'],
  },
  {
    id: 'rights',
    label: 'Your Rights',
    bullets: ['Edit your profile', 'Download your data', 'Change privacy settings', 'Request correction or deletion'],
  },
  {
    id: 'deletion',
    label: 'Account Deletion',
    bullets: ['Request permanent deletion', 'Some records retained by law', 'Backups expire on schedule', 'Contact support to start'],
  },
  {
    id: 'children',
    label: "Children's Privacy",
    bullets: ['Intended for ages 13+', 'We do not knowingly collect under 13', 'Parents may request removal', 'Contact privacy@eventthon.com'],
  },
  {
    id: 'international',
    label: 'International Users',
    bullets: ['Data may be processed globally', 'Safeguards for transfers', 'Local laws may still apply', 'Contact us for region questions'],
  },
  {
    id: 'third-party',
    label: 'Third-Party Services',
    bullets: ['Google / GitHub / LinkedIn login', 'Cloud storage providers', 'Payment processors', 'Their policies also apply'],
  },
  {
    id: 'donations',
    label: 'Donation Hub',
    bullets: ['Donation intents & amounts', 'Verified org redirects', 'Receipt metadata when available', 'No sale of donor lists'],
  },
  {
    id: 'updates',
    label: 'Updates to this Policy',
    kind: 'paragraph',
    body:
      'We may update this Privacy Policy. When significant changes are made, users will be notified inside EventThon.',
  },
  {
    id: 'contact',
    label: 'Contact Us',
    kind: 'contact',
    lead: 'For privacy-related questions:',
    email: 'privacy@eventthon.com',
    links: [
      { label: 'Support Center', href: '/company/contact' },
      { label: 'Help Center', href: '/resources/help' },
      { label: 'Contact Form', href: '/company/contact' },
    ],
  },
];
