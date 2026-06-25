import {
  FiAward,
  FiBell,
  FiBookmark,
  FiBriefcase,
  FiClipboard,
  FiGrid,
  FiLayers,
  FiSettings,
  FiStar,
  FiTarget,
} from 'react-icons/fi';

/** Sections that show a Coming Soon placeholder instead of full views. */
export const JOBS_COMING_SOON_SECTION_IDS = new Set(['assessment', 'interview', 'salary']);

export const jobMenu = [
  { id: 'browse', label: 'Browse Jobs', icon: FiBriefcase, count: null, badge: null },
  { id: 'applications', label: 'My Applications', icon: FiClipboard, count: null, badge: null },
  { id: 'saved', label: 'Saved Jobs', icon: FiBookmark, count: null, badge: null },
  { id: 'alerts', label: 'Job Alerts', icon: FiBell, count: null, badge: null },
  { id: 'recommended', label: 'Recommended', icon: FiStar, count: null, badge: null },
  {
    id: 'assessment',
    label: 'Skill Assessment',
    icon: FiAward,
    count: null,
    badge: null,
    comingSoon: true,
  },
  {
    id: 'interview',
    label: 'Job Interview Prep',
    icon: FiTarget,
    count: null,
    badge: null,
    comingSoon: true,
  },
  { id: 'companies', label: 'Companies', icon: FiGrid, count: null, badge: null },
  {
    id: 'salary',
    label: 'Salary Insights',
    icon: FiLayers,
    count: null,
    badge: null,
    comingSoon: true,
  },
  { id: 'settings', label: 'Settings', icon: FiSettings, count: null, badge: null },
];

export function isJobsComingSoonSection(sectionId) {
  return JOBS_COMING_SOON_SECTION_IDS.has(sectionId);
}

export function getJobMenuItem(sectionId) {
  return jobMenu.find((item) => item.id === sectionId) || null;
}

export const topCategories = [
  {
    label: 'Software Development',
    value: 1248,
    iconUi: {
      gradient: 'linear-gradient(145deg, rgba(37, 99, 235, 0.5), rgba(14, 165, 233, 0.28))',
      glow: 'rgba(59, 130, 246, 0.42)',
    },
  },
  {
    label: 'Design & Creative',
    value: 876,
    iconUi: {
      gradient: 'linear-gradient(145deg, rgba(219, 39, 119, 0.48), rgba(168, 85, 247, 0.3))',
      glow: 'rgba(236, 72, 153, 0.42)',
    },
  },
  {
    label: 'Marketing',
    value: 642,
    iconUi: {
      gradient: 'linear-gradient(145deg, rgba(22, 163, 74, 0.48), rgba(20, 184, 166, 0.28))',
      glow: 'rgba(34, 197, 94, 0.4)',
    },
  },
  {
    label: 'Data Science',
    value: 521,
    iconUi: {
      gradient: 'linear-gradient(145deg, rgba(2, 132, 199, 0.52), rgba(37, 99, 235, 0.28))',
      glow: 'rgba(14, 165, 233, 0.42)',
    },
  },
  {
    label: 'Product Management',
    value: 318,
    iconUi: {
      gradient: 'linear-gradient(145deg, rgba(5, 150, 105, 0.5), rgba(16, 185, 129, 0.3))',
      glow: 'rgba(16, 185, 129, 0.42)',
    },
  },
  {
    label: 'DevOps & IT',
    value: 284,
    iconUi: {
      gradient: 'linear-gradient(145deg, rgba(71, 85, 105, 0.5), rgba(51, 65, 85, 0.28))',
      glow: 'rgba(148, 163, 184, 0.34)',
    },
  },
  {
    label: 'Business',
    value: 213,
    iconUi: {
      gradient: 'linear-gradient(145deg, rgba(79, 70, 229, 0.5), rgba(30, 64, 175, 0.3))',
      glow: 'rgba(99, 102, 241, 0.4)',
    },
  },
];
