/**
 * User Management: display helpers for admin user table and filters.
 */

import { getUserRankMeta } from '../../../../models/Rank';

/** `icon` maps to lucide keys in UserManagementStats */
export const USER_MANAGEMENT_STATS = [
  {
    id: 'total',
    label: 'Total Users',
    value: '12,458',
    change: '+18.5%',
    detail: 'vs last month',
    color: '#8b5cf6',
    icon: 'users',
  },
  {
    id: 'active',
    label: 'Active Users',
    value: '9,843',
    change: '+15.2%',
    detail: 'vs last month',
    color: '#10b981',
    icon: 'activity',
  },
  {
    id: 'verified',
    label: 'Verified Users',
    value: '8,201',
    change: '+20.1%',
    detail: 'vs last month',
    color: '#6366f1',
    icon: 'badgeCheck',
  },
  {
    id: 'new',
    label: 'New Users (This Month)',
    value: '1,247',
    change: '+25.7%',
    detail: 'vs last month',
    color: '#f59e0b',
    icon: 'userPlus',
  },
  {
    id: 'suspended',
    label: 'Suspended Users',
    value: '214',
    change: '-5.3%',
    detail: 'vs last month',
    color: '#ef4444',
    icon: 'userX',
  },
];

export const USER_FILTER_TABS = [
  { id: 'all', label: 'All Users' },
  { id: 'active', label: 'Active' },
  { id: 'verified', label: 'Verified' },
  { id: 'unverified', label: 'Unverified' },
  { id: 'suspended', label: 'Suspended' },
  { id: 'deleted', label: 'Deleted' },
];

/** Presence dot: green = active / orange = away */
export function presenceDotClass(presence) {
  if (presence === 'away') return 'um-dot--away';
  if (presence === 'offline') return 'um-dot--offline';
  return 'um-dot--online';
}

const RANK_META = {
  frontline: getUserRankMeta('E-1'),
  specialist: getUserRankMeta('E-2'),
  squad: getUserRankMeta('E-4'),
  recruit: getUserRankMeta('E-1'),
  'e-1': getUserRankMeta('E-1'),
  'e-2': getUserRankMeta('E-2'),
  'e-3': getUserRankMeta('E-3'),
  'e-4': getUserRankMeta('E-4'),
  'e-5': getUserRankMeta('E-5'),
  'e-6': getUserRankMeta('E-6'),
};

const STATUS_META = {
  approved: { label: 'Active', chipClass: 'um-status--active' },
  pending: { label: 'Pending Verification', chipClass: 'um-status--pending' },
  suspended: { label: 'Suspended', chipClass: 'um-status--suspended' },
  unverified: { label: 'Unverified', chipClass: 'um-status--unverified' },
  deleted: { label: 'Deleted', chipClass: 'um-status--deleted' },
};

export function getRankMeta(rankKey) {
  if (RANK_META[rankKey]) return RANK_META[rankKey];
  return getUserRankMeta(rankKey);
}

export function getStatusMeta(adminStatus) {
  return STATUS_META[adminStatus] || STATUS_META.unverified;
}

export function filterRowsByTab(rows, tabId) {
  if (tabId === 'all') return rows;
  if (tabId === 'active' || tabId === 'verified') {
    return rows.filter((r) => r.adminStatus === 'approved');
  }
  if (tabId === 'unverified') {
    return rows.filter((r) => r.adminStatus === 'pending');
  }
  if (tabId === 'suspended') {
    return rows.filter((r) => r.adminStatus === 'suspended');
  }
  if (tabId === 'deleted') {
    return rows.filter((r) => r.adminStatus === 'deleted');
  }
  return rows;
}
