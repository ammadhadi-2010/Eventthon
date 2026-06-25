import { FiAward, FiEdit3, FiPlusCircle, FiUsers } from 'react-icons/fi';

export const POST_WIZARD_TYPES = ['POST', 'SQUAD', 'PROJECT', 'WIN'];

export const AI_HIGHLIGHT_TYPES = ['PROJECT', 'WIN'];

export const POST_TYPE_TABS = [
  { key: 'POST', label: 'Update', Icon: FiEdit3, color: '#3b82f6' },
  { key: 'SQUAD', label: 'Squad', Icon: FiUsers, color: '#a855f7' },
  { key: 'PROJECT', label: 'Project', Icon: FiPlusCircle, color: '#10b981' },
  { key: 'WIN', label: 'Win', Icon: FiAward, color: '#f59e0b' },
];

export const POST_TYPE_COLORS = {
  POST: '#3b82f6',
  SQUAD: '#a855f7',
  PROJECT: '#10b981',
  WIN: '#f59e0b',
};

export function createEmptyDrafts() {
  return { POST: '', SQUAD: '', PROJECT: '', WIN: '' };
}

export function submitLabelForType(type) {
  if (type === 'SQUAD') return 'Ask Now';
  if (type === 'WIN') return 'Share Win';
  if (type === 'PROJECT') return 'Post Project';
  return 'Post Update';
}
