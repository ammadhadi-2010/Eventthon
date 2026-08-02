import {
  FiAward,
  FiBarChart2,
  FiBriefcase,
  FiCheckCircle,
  FiCreditCard,
  FiFileText,
  FiFolder,
  FiHome,
  FiMessageSquare,
  FiPlusCircle,
  FiSearch,
  FiSettings,
  FiUsers,
  FiUserPlus,
  FiBookmark,
  FiDollarSign,
  FiHeart,
  FiEdit3,
} from 'react-icons/fi';

/** Grouped Company Hub sidebar — matches employer hub IA. */
export const COMPANY_HUB_MENU_SECTIONS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    items: [
      { id: 'overview', label: 'Dashboard', to: '/company/dashboard', icon: FiHome, end: true },
    ],
  },
  {
    id: 'jobs',
    label: 'Jobs',
    items: [
      { id: 'all-jobs', label: 'All Jobs', to: '/company/dashboard/jobs', icon: FiBriefcase },
      { id: 'add-job', label: 'Post a Job', to: '/company/dashboard/jobs/new', icon: FiPlusCircle },
      {
        id: 'draft-jobs',
        label: 'Draft Jobs',
        to: '/company/dashboard/draft-jobs',
        icon: FiEdit3,
      },
      { id: 'applications', label: 'Applications', to: '/company/dashboard/applications', icon: FiFileText },
      {
        id: 'saved-candidates',
        label: 'Saved Candidates',
        to: '/company/dashboard/saved-candidates',
        icon: FiBookmark,
      },
    ],
  },
  {
    id: 'talent',
    label: 'Talent',
    items: [
      {
        id: 'talent-search',
        label: 'Talent Search',
        to: '/company/dashboard/coming-soon/talent',
        icon: FiSearch,
        comingSoon: true,
      },
      { id: 'projects', label: 'Projects', to: '/projects', icon: FiFolder },
      { id: 'messages', label: 'Messages', to: '/company/messages', icon: FiMessageSquare },
      { id: 'team', label: 'Team Members', to: '/company/dashboard/team', icon: FiUsers },
      {
        id: 'followers',
        label: 'Followers',
        to: '/company/dashboard/followers',
        icon: FiHeart,
      },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    items: [
      {
        id: 'analytics',
        label: 'Analytics',
        to: '/company/dashboard/coming-soon/analytics',
        icon: FiBarChart2,
        comingSoon: true,
      },
    ],
  },
  {
    id: 'finance',
    label: 'Finance',
    items: [
      {
        id: 'wallet',
        label: 'Company Wallet',
        to: '/company/dashboard/coming-soon/wallet',
        icon: FiDollarSign,
        comingSoon: true,
      },
      {
        id: 'billing',
        label: 'Billing & Subscription',
        to: '/company/dashboard/coming-soon/billing',
        icon: FiCreditCard,
        comingSoon: true,
      },
    ],
  },
  {
    id: 'company',
    label: 'Company',
    items: [
      {
        id: 'verification',
        label: 'Verification',
        to: '/company/dashboard/settings',
        icon: FiCheckCircle,
        verifiedBadge: true,
      },
      { id: 'profile', label: 'Public Profile', to: '/company/dashboard/profile', icon: FiBriefcase },
      { id: 'settings', label: 'Settings', to: '/company/dashboard/settings', icon: FiSettings },
    ],
  },
];

export const COMPANY_HUB_MENU = COMPANY_HUB_MENU_SECTIONS.flatMap((section) =>
  section.items.map((item) => ({ ...item, section: section.id })),
);

export const DONUT_COLORS = {
  pending: '#84cc16',
  reviewing: '#f97316',
  shortlisted: '#3b82f6',
  rejected: '#ef4444',
  hired: '#a78bfa',
};

export const STATUS_CLASS = {
  pending: 'cp-status--pending',
  reviewing: 'cp-status--reviewing',
  shortlisted: 'cp-status--shortlisted',
  rejected: 'cp-status--rejected',
};

export const COMPANY_HUB_QUICK_ACTIONS = [
  { id: 'post-job', label: 'Post a Job', to: '/company/dashboard/jobs/new', icon: FiPlusCircle, tone: 'violet' },
  { id: 'drafts', label: 'Draft Jobs', to: '/company/dashboard/draft-jobs', icon: FiEdit3, tone: 'sky' },
  {
    id: 'talent',
    label: 'Talent Search',
    to: '/company/dashboard/coming-soon/talent',
    icon: FiSearch,
    tone: 'mint',
  },
  { id: 'invite', label: 'Invite Team', to: '/company/dashboard/team', icon: FiUserPlus, tone: 'amber' },
  {
    id: 'wallet',
    label: 'Company Wallet',
    to: '/company/dashboard/coming-soon/wallet',
    icon: FiDollarSign,
    tone: 'emerald',
  },
  {
    id: 'analytics',
    label: 'Analytics Report',
    to: '/company/dashboard/coming-soon/analytics',
    icon: FiBarChart2,
    tone: 'rose',
  },
  { id: 'manage-jobs', label: 'Manage Jobs', to: '/company/dashboard/jobs', icon: FiBriefcase, tone: 'indigo' },
  { id: 'settings', label: 'Settings', to: '/company/dashboard/settings', icon: FiSettings, tone: 'cyan' },
];

export const COMPANY_HUB_SETTINGS_LINKS = [
  { id: 'general', label: 'General', hint: 'Company profile & branding', to: '/company/dashboard/settings', icon: FiSettings, tone: 'violet' },
  { id: 'hiring', label: 'Hiring', hint: 'Jobs and application flow', to: '/company/dashboard/jobs', icon: FiBriefcase, tone: 'sky' },
  { id: 'team', label: 'Team & Roles', hint: 'Members and permissions', to: '/company/dashboard/team', icon: FiUsers, tone: 'mint' },
  { id: 'notification', label: 'Notification', hint: 'Alerts and digests', to: '/company/notifications', icon: FiAward, tone: 'amber' },
  {
    id: 'privacy',
    label: 'Privacy',
    hint: 'Visibility and data',
    to: '/company/dashboard/coming-soon/privacy',
    icon: FiCheckCircle,
    tone: 'rose',
  },
  {
    id: 'billing',
    label: 'Billing & Subscription',
    hint: 'Plan and invoices',
    to: '/company/dashboard/coming-soon/billing',
    icon: FiCreditCard,
    tone: 'emerald',
  },
];
