import { Bot, MailOpen, Reply, UserPlus, Send } from 'lucide-react';

export const ACTIVITY_ICON_MAP = {
  'mail-open': MailOpen,
  reply: Reply,
  'user-plus': UserPlus,
  send: Send,
  bot: Bot,
};

export function mapActivityRow(row = {}) {
  return {
    id: row.id,
    type: row.type,
    tone: row.tone || 'violet',
    prefix: row.prefix || '',
    highlight: row.highlight || '',
    time: row.time || '—',
    detail: row.detail || '',
    icon: ACTIVITY_ICON_MAP[row.icon] || Send,
  };
}
