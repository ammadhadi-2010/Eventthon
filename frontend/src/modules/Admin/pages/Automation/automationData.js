import {
  CheckCircle2,
  Clock,
  Globe,
  Send,
  XCircle,
} from 'lucide-react';
import { API_BASE_URL } from '../../../../api/axiosConfig';

export const AUTOMATION_STAT_DEFS = [
  { id: 'total', label: 'Total Posts', icon: Send, color: '#8b5cf6', footKey: 'growthPct', footSuffix: '% vs last 7 days', footPrefix: '+' },
  { id: 'successful', label: 'Successful', icon: CheckCircle2, color: '#22c55e', footKey: 'successRate', footSuffix: '% Success Rate' },
  { id: 'pending', label: 'Pending', icon: Clock, color: '#f59e0b', footKey: 'pendingPct', footSuffix: '% of total posts' },
  { id: 'failed', label: 'Failed', icon: XCircle, color: '#ef4444', footKey: 'failedPct', footSuffix: '% of total posts' },
  { id: 'platforms', label: 'Platforms', icon: Globe, color: '#3b82f6', footStatic: 'Connected Platforms' },
];

export const AUTOMATION_PLATFORMS = [
  { id: 'facebook', label: 'Facebook', short: 'FB' },
  { id: 'instagram', label: 'Instagram', short: 'IG' },
  { id: 'x', label: 'X', short: 'X' },
  { id: 'linkedin', label: 'LinkedIn', short: 'IN' },
  { id: 'telegram', label: 'Telegram', short: 'TG' },
  { id: 'whatsapp', label: 'WhatsApp', short: 'WA' },
  { id: 'youtube', label: 'YouTube', short: 'YT' },
];

export const STATUS_CLASS = {
  success: 'auto-status--success',
  pending: 'auto-status--pending',
  failed: 'auto-status--failed',
};

export function resolveAutomationMediaUrl(path) {
  if (!path || typeof path !== 'string') return '';
  const trimmed = path.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http') || trimmed.startsWith('blob:') || trimmed.startsWith('data:')) return trimmed;
  return `${API_BASE_URL}${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}`;
}

export function resolvePostImageurl(row = {}) {
  const raw = String(row.imageurl || '').trim();
  if (raw) return resolveAutomationMediaUrl(raw) || raw;
  return '';
}

export function buildAutomationStats(metrics = {}) {
  return AUTOMATION_STAT_DEFS.map((item) => {
    let change = item.footStatic || 'Live from database';
    if (item.footKey && metrics[item.footKey] != null) {
      const val = metrics[item.footKey];
      change = `${item.footPrefix || ''}${val}${item.footSuffix || ''}`;
    }
    return {
      ...item,
      value: Number(metrics[item.id] ?? 0).toLocaleString(),
      change,
    };
  });
}

export function postPlaceholder(title = 'Post') {
  const text = encodeURIComponent(title.slice(0, 2).toUpperCase());
  return `https://ui-avatars.com/api/?name=${text}&background=6366f1&color=fff&size=64`;
}
