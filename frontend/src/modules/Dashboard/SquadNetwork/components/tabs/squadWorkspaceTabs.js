import {
  BarChart3,
  FolderOpen,
  LayoutDashboard,
  MessageSquare,
  MessagesSquare,
  Settings,
  TrendingUp,
  Users,
  FolderKanban,
} from 'lucide-react';

export const PUBLIC_SQUAD_TABS = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Projects', icon: FolderKanban, countKey: 'projects' },
  { label: 'Members', icon: Users, countKey: 'members' },
  { label: 'Activity', icon: TrendingUp, countKey: 'activity' },
  { label: 'Discussions', icon: MessagesSquare, countKey: 'discussions' },
  { label: 'Files', icon: FolderOpen, countKey: 'files' },
  { label: 'Analytics', icon: BarChart3 },
  { label: 'Settings', icon: Settings },
];

/** Dashboard squad hub — Overview → Chat → Projects → … */
export const SQUAD_HUB_TABS = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Chat', icon: MessageSquare, countKey: 'messages' },
  { label: 'Projects', icon: FolderKanban, countKey: 'projects' },
  { label: 'Members', icon: Users, countKey: 'members' },
  { label: 'Activity', icon: TrendingUp, countKey: 'activity' },
  { label: 'Files', icon: FolderOpen, countKey: 'files' },
  { label: 'Settings', icon: Settings },
];

/** Public explore showroom — full tab strip. */
export const SQUAD_WORKSPACE_TABS = [
  ...PUBLIC_SQUAD_TABS,
  { label: 'Chat', icon: MessageSquare, countKey: 'messages' },
];

export function resolveTabCounts(tab, state = {}) {
  if (!tab?.countKey) return undefined;

  const projects = state.projects || [];
  const members = state.members || [];
  const files = state.files || [];
  const activity = state.activity || state.activityFeed || [];
  const messages = state.chatMessages || [];

  if (tab.countKey === 'projects') return projects.length;
  if (tab.countKey === 'members') return members.length;
  if (tab.countKey === 'files') return files.length;
  if (tab.countKey === 'activity') return activity.length;
  if (tab.countKey === 'messages') return messages.length;
  if (tab.countKey === 'discussions') {
    const fromFeed = (state.activityFeed || activity).length;
    return Math.max(28, fromFeed * 4);
  }
  return undefined;
}
