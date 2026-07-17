import {
  Handshake,
  MessageSquare,
  FlaskConical,
  Briefcase,
  Bug,
  FileText,
} from 'lucide-react';

const ICON_MAP = {
  handshake: Handshake,
  'message-square': MessageSquare,
  'flask-conical': FlaskConical,
  briefcase: Briefcase,
  bug: Bug,
  'file-text': FileText,
};

export function resolveTemplateIcon(name) {
  const key = String(name || '').trim().toLowerCase();
  return ICON_MAP[key] || FileText;
}
