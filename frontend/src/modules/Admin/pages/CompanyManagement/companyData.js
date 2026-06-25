import { BadgeCheck, Briefcase, Building2, CheckCircle2, Users } from 'lucide-react';

export const COMPANY_STAT_DEFS = [
  { id: 'total', label: 'Total Companies', icon: Building2, color: '#8b5cf6' },
  { id: 'verified', label: 'Verified Companies', icon: BadgeCheck, color: '#22c55e' },
  { id: 'active', label: 'Active Companies', icon: CheckCircle2, color: '#3b82f6' },
  { id: 'hiring', label: 'Companies Hiring', icon: Users, color: '#f59e0b' },
  { id: 'totalJobsPosted', label: 'Total Jobs Posted', icon: Briefcase, color: '#ec4899' },
];

export const COMPANY_STATUS_CLASS = {
  active: 'cm-status--active',
  pending: 'cm-status--pending',
  verified: 'cm-status--active',
  rejected: 'cm-status--expired',
  inactive: 'cm-status--expired',
};

export const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'verified', label: 'Verified' },
];

export function buildCompanyStats(metrics) {
  const m = metrics || {};
  return COMPANY_STAT_DEFS.map((item) => ({
    ...item,
    value: String(m[item.id] ?? 0),
    change: m[item.id] ? 'Live from database' : 'No records yet',
    detail: 'vs last month',
  }));
}

export function companyAvatar(name = '') {
  const text = encodeURIComponent((name || 'Co').slice(0, 2).toUpperCase());
  return `https://ui-avatars.com/api/?name=${text}&background=6366f1&color=fff&size=64`;
}
