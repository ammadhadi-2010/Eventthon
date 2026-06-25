import { FiBell, FiKey, FiShield, FiSliders, FiTrash2, FiUsers } from 'react-icons/fi';

export const LEFT_MENU = [
  { id: 'info', label: 'Squad Info', icon: FiUsers },
  { id: 'permissions', label: 'Permissions', icon: FiShield },
  { id: 'roles', label: 'Manage Roles', icon: FiKey },
  { id: 'notifications', label: 'Notifications', icon: FiBell },
  { id: 'integrations', label: 'Integrations', icon: FiSliders },
  { id: 'danger', label: 'Danger Zone', icon: FiTrash2 },
];

export const SETTINGS_ITEMS = [
  { key: 'publicListing', label: 'Public listing (show public showroom)' },
  { key: 'inviteOthers', label: 'Allow members to invite others' },
  { key: 'adminProjectCreate', label: 'Only admins can create projects' },
  { key: 'memberApproval', label: 'Require approval for new members' },
  { key: 'showOnline', label: 'Show online status' },
];

export const MENU_SETTING_ITEMS = {
  info: SETTINGS_ITEMS,
  permissions: [
    { key: 'inviteOthers', label: 'Allow members to invite others' },
    { key: 'adminProjectCreate', label: 'Only admins can create projects' },
    { key: 'memberApproval', label: 'Require approval for new members' },
  ],
  roles: [
    { key: 'adminProjectCreate', label: 'Only admins can create projects' },
    { key: 'memberApproval', label: 'Require approval before role changes' },
  ],
  notifications: [
    { key: 'showOnline', label: 'Show online status in member list' },
    { key: 'notifyMentions', label: 'Notify members for @mentions' },
    { key: 'notifyUploads', label: 'Notify for new file uploads' },
  ],
  integrations: [
    { key: 'integrationDrive', label: 'Enable cloud drive integration' },
    { key: 'integrationMail', label: 'Enable email digest integration' },
  ],
  danger: [
    { key: 'dangerArchive', label: 'Archive squad before deletion (recommended)' },
  ],
};

export const MENU_META = {
  info: { title: 'Squad Settings', note: 'General controls for this squad.' },
  permissions: { title: 'Permissions', note: 'Control who can do what in this squad.' },
  roles: { title: 'Manage Roles', note: 'Admin and moderator management preferences.' },
  notifications: { title: 'Notifications', note: 'Manage alerts and updates for members.' },
  integrations: { title: 'Integrations', note: 'Connect squad tools with external services.' },
  danger: { title: 'Danger Zone', note: 'High-impact actions. Review carefully before applying.' },
};

export const INITIAL_TOGGLES = {
  publicListing: true,
  inviteOthers: true,
  adminProjectCreate: false,
  memberApproval: true,
  showOnline: true,
  notifyMentions: true,
  notifyUploads: false,
  integrationDrive: true,
  integrationMail: false,
  dangerArchive: true,
};
