import { Briefcase, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { API_BASE_URL } from '../../../../api/axiosConfig';

export const JOB_STAT_DEFS = [
  { id: 'total', label: 'Total Jobs', icon: Briefcase, color: '#8b5cf6' },
  { id: 'active', label: 'Active Jobs', icon: CheckCircle2, color: '#22c55e' },
  { id: 'pending', label: 'Pending Jobs', icon: Clock, color: '#f59e0b' },
  { id: 'expired', label: 'Expired Jobs', icon: XCircle, color: '#ef4444' },
];

export const JOB_STAT_GRID_IDS = ['total', 'active', 'pending', 'expired'];

export const JOB_STATUS_CLASS = {
  active: 'jm-status--active',
  pending: 'jm-status--pending',
  expired: 'jm-status--expired',
};

export const JOB_MGMT_TABS = [
  { id: 'jobs', label: 'All Jobs' },
  { id: 'applications', label: 'Job Applications' },
  { id: 'alerts', label: 'Job Alerts' },
];

export const APP_STATUS_CLASS = {
  applied: 'jm-status--pending',
  shortlisted: 'jm-status--active',
  rejected: 'jm-status--expired',
};

export const APP_STATUS_OPTIONS = [
  { value: 'applied', label: 'Applied' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'rejected', label: 'Rejected' },
];

export const JOB_CATEGORY_CLASS = {
  Development: 'jm-cat--dev',
  Design: 'jm-cat--design',
  Marketing: 'jm-cat--marketing',
};

export function resolveJobMediaUrl(path) {
  if (!path || typeof path !== 'string') return '';
  const trimmed = path.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http') || trimmed.startsWith('blob:') || trimmed.startsWith('data:')) return trimmed;
  return `${API_BASE_URL}${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}`;
}

export function resolveJobImageurl(row = {}) {
  const raw = String(row.imageurl || row.company_imageurl || '').trim();
  if (raw) return resolveJobMediaUrl(raw) || raw;
  return companyAvatar(row.company);
}

export function buildJobStats(metrics) {
  const m = metrics || {};
  return JOB_STAT_DEFS.map((item) => ({
    ...item,
    value: Number(m[item.id] ?? 0).toLocaleString(),
    change: m[item.id] ? 'Live from database' : 'No records yet',
  }));
}

export function companyAvatar(name = '') {
  const text = encodeURIComponent((name || 'Co').slice(0, 2).toUpperCase());
  return `https://ui-avatars.com/api/?name=${text}&background=6366f1&color=fff&size=64`;
}
