import {
  FiBriefcase,
  FiEye,
  FiFileText,
  FiTrendingUp,
  FiUserCheck,
  FiUsers,
} from 'react-icons/fi';

function liveDelta(value) {
  if (value == null || value === '' || value === '—') return null;
  return value;
}

/** KPI cards — values + deltas from company portal dashboard API only. */
export const COMPANY_HUB_KPIS = [
  {
    key: 'employees',
    label: 'Employees',
    tone: 'violet',
    Icon: FiUsers,
    deltaSuffix: 'company size',
    getValue: (c) => c?.employees ?? '—',
    getDelta: () => null,
  },
  {
    key: 'openJobs',
    label: 'Active Jobs',
    tone: 'blue',
    Icon: FiBriefcase,
    deltaSuffix: 'this week',
    getValue: (c) => c?.openJobs ?? 0,
    getDelta: (a) => liveDelta(a?.deltas?.jobViews),
  },
  {
    key: 'totalApplications',
    label: 'Total Applications',
    tone: 'green',
    Icon: FiFileText,
    deltaSuffix: 'this week',
    getValue: (c) => c?.totalApplications ?? 0,
    getDelta: (a) => liveDelta(a?.deltas?.applications),
  },
  {
    key: 'hired',
    label: 'Hired',
    tone: 'amber',
    Icon: FiUserCheck,
    deltaSuffix: 'this week',
    getValue: (c) => c?.hired ?? 0,
    getDelta: (a) => liveDelta(a?.deltas?.hires),
  },
  {
    key: 'followers',
    label: 'Followers',
    tone: 'magenta',
    Icon: FiUsers,
    deltaSuffix: 'this month',
    getValue: (c) => c?.followers ?? 0,
    getDelta: (a) => liveDelta(a?.deltas?.followersGrowth),
  },
  {
    key: 'profileViews',
    label: 'Profile Views',
    tone: 'indigo',
    Icon: FiEye,
    deltaSuffix: 'this month',
    getValue: (c) =>
      c?.profileViews != null ? Number(c.profileViews).toLocaleString() : '0',
    getDelta: (a) => liveDelta(a?.deltas?.profileViews),
  },
  {
    key: 'rating',
    label: 'Company Rating',
    tone: 'teal',
    Icon: FiTrendingUp,
    showStars: true,
    getValue: (c) => {
      if (c?.rating == null || c?.rating === '') return '—';
      return Number(c.rating).toFixed(1);
    },
    getDelta: () => null,
  },
];
