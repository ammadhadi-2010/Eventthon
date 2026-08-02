export const DEFAULT_OPPORTUNITY_SETTINGS = {
  opportunitiesEnabled: true,
  requireAdminApproval: true,
  membersCanPost: true,
  opportunityAlertsEnabled: true,
  showBrowseOpportunities: true,
  maxOpportunityAlertsPerUser: 20,
  opportunityTypes:
    'Freelance Work, One-time Task, Short-term Project, Need Team Member, Need Co-Founder, Need Investor, Collaboration Request',
};

export const OPPORTUNITY_SETTING_ROWS = [
  {
    id: 'opportunitiesEnabled',
    label: 'Opportunities Enabled',
    description: 'Allow community opportunity listings in Jobs hub',
    type: 'toggle',
    icon: 'zap',
  },
  {
    id: 'requireAdminApproval',
    label: 'Require Admin Approval',
    description: 'Opportunity posts stay pending until approved',
    type: 'toggle',
    icon: 'shield',
  },
  {
    id: 'membersCanPost',
    label: 'Members Can Post',
    description: 'Signed-in members can publish opportunities',
    type: 'toggle',
    icon: 'users',
  },
  {
    id: 'opportunityAlertsEnabled',
    label: 'Opportunity Alerts',
    description: 'Allow seekers to create opportunity match alerts',
    type: 'toggle',
    icon: 'bell',
  },
  {
    id: 'showBrowseOpportunities',
    label: 'Browse Opportunities Menu',
    description: 'Show Browse Opportunities in the Jobs left sidebar',
    type: 'toggle',
    icon: 'grid',
  },
  {
    id: 'maxOpportunityAlertsPerUser',
    label: 'Max Opportunity Alerts',
    description: 'Maximum opportunity alerts a seeker can create',
    type: 'number',
    icon: 'hash',
  },
  {
    id: 'opportunityTypes',
    label: 'Opportunity Types',
    description: 'Comma-separated types shown in create + browse filters',
    type: 'textarea',
    icon: 'list',
  },
];
