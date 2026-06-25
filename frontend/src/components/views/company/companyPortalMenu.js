export const COMPANY_HUB_MENU = [
  { id: 'dashboard', label: 'Dashboard', to: '/company/dashboard' },
  {
    id: 'jobs',
    label: 'Jobs',
    children: [
      { id: 'all-jobs', label: 'All Jobs', to: '/company/dashboard/jobs' },
      { id: 'add-job', label: 'Add New Job', to: '/jobs/alerts/new' },
      { id: 'applications', label: 'Applications', to: '/company/dashboard/applications' },
      { id: 'alerts', label: 'Job Alerts', to: '/jobs/alerts' },
    ],
  },
  { id: 'talent', label: 'Talent Search', to: '/company/dashboard/coming-soon/talent', comingSoon: true },
  { id: 'profile', label: 'Public Profile', to: '/company/dashboard/profile' },
  { id: 'team', label: 'Team Members', to: '/company/dashboard/team' },
  { id: 'projects', label: 'Projects', to: '/projects' },
  { id: 'analytics', label: 'Analytics', to: '/company/dashboard/coming-soon/analytics', comingSoon: true },
  { id: 'messages', label: 'Messages', to: '/company/messages' },
  { id: 'notifications', label: 'Notifications', to: '/company/notifications' },
  { id: 'settings', label: 'Company Settings', to: '/company/dashboard/settings' },
];

export const DONUT_COLORS = {
  pending: '#84cc16',
  reviewing: '#f97316',
  shortlisted: '#3b82f6',
  rejected: '#ef4444',
};

export const STATUS_CLASS = {
  pending: 'cp-status--pending',
  reviewing: 'cp-status--reviewing',
  shortlisted: 'cp-status--shortlisted',
  rejected: 'cp-status--rejected',
};
