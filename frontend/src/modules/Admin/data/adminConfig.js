import {
  Award,
  BarChart3,
  Bug,
  Briefcase,
  Building2,
  ClipboardList,
  Coins,
  CreditCard,
  Database,
  FileText,
  FolderKanban,
  FolderOpen,
  HardDrive,
  LayoutDashboard,
  LifeBuoy,
  Mail,
  Receipt,
  Search,
  Send,
  Server,
  Settings,
  Shield,
  Sparkles,
  Users,
  Wallet,
} from 'lucide-react';

/** Primary admin sidebar — chat/notifications live in the top admin header only. */
export const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, to: '/admin-control' },
  { id: 'users', label: 'User Management', icon: Users, to: '/admin-control/users' },
  { id: 'squads', label: 'Squad Management', icon: Briefcase, to: '/admin-control/squads' },
  { id: 'gigs', label: 'Gig Management', icon: FolderKanban, to: '/admin-control/gigs' },
  { id: 'projects', label: 'Project Management', icon: FolderOpen, to: '/admin-control/projects' },
  { id: 'jobs', label: 'Job Management', icon: ClipboardList, to: '/admin-control/jobs' },
  { id: 'automation', label: 'Automation', icon: Send, to: '/admin-control/automation' },
  { id: 'email-outreach', label: 'Email Outreach', icon: Mail, to: '/admin-control/email-outreach' },
  { id: 'wallet', label: 'Wallet & Finance', icon: Wallet, to: '/admin-control/wallet' },
  { id: 'transactions', label: 'Transactions', icon: Receipt, to: '/admin-control/transactions' },
  {
    id: 'companies',
    label: 'Companies',
    icon: Building2,
    to: '/admin-control/companies',
    children: [
      { id: 'companies-all', label: 'All Companies', to: '/admin-control/companies' },
      { id: 'companies-add', label: 'Add Company', to: '/company-hub/create' },
      {
        id: 'companies-verification',
        label: 'Verification Requests',
        to: '/admin-control/companies/verification',
        badge: 12,
      },
    ],
  },
  { id: 'ranks', label: 'Rank Management', icon: Award, to: '/admin-control/ranks' },
  { id: 'bug-reports', label: '🐞 User Bug Reports', icon: Bug, to: '/admin-control/bug-reports' },
  {
    id: 'footer-cms',
    label: 'Footer CMS Hub',
    to: '/admin-control/footer-resources',
    variant: 'footer-cms',
    section: 'CMS Content',
  },
  {
    id: 'founders-story',
    label: "Founder's Story Content",
    icon: FileText,
    to: '/admin-control/founders-story',
    section: 'CMS Content',
  },
  { id: 'settings', label: 'System Settings', icon: Settings, to: '/admin-control/settings' },
];

export const systemHealthMeta = [
  { id: 'web_server', label: 'Web Server', icon: Server },
  { id: 'database', label: 'Database', icon: Database },
  { id: 'api_service', label: 'API Service', icon: Shield },
  { id: 'wallet_system', label: 'Wallet System', icon: Wallet },
  { id: 'storage', label: 'Storage', icon: HardDrive },
];

export const commandCenterCards = [
  {
    label: 'Manage Users',
    desc: 'Verify and monitor platform users',
    color: 'from-violet-500/20 to-violet-600/5',
    icon: Users,
    to: '/admin-control/users',
  },
  {
    label: 'Manage Projects',
    desc: 'Review and manage live projects',
    color: 'from-blue-500/20 to-blue-600/5',
    icon: FolderKanban,
    to: '/admin-control/projects',
  },
  {
    label: 'Wallet & Finance',
    desc: 'Thon balances, settlements, and payouts',
    color: 'from-emerald-500/20 to-emerald-600/5',
    icon: Wallet,
    to: '/admin-control/wallet',
  },
  {
    label: 'Reports',
    desc: 'Analyze platform performance',
    color: 'from-amber-500/20 to-amber-600/5',
    icon: BarChart3,
    to: '/admin-control/automation',
  },
];

export const topbarIcons = {
  search: Search,
  settings: Settings,
  sparkles: Sparkles,
  creditCard: CreditCard,
};

/** Legacy full list for dashboards that still reference finance / coin tabs (optional). */
export const sidebarItemsExtended = [
  ...sidebarItems,
  { id: 'finance', label: 'Finance & Wallet', icon: Wallet, to: '/admin-control/wallet' },
  { id: 'coin', label: 'Thon Management', icon: Coins, to: '/admin-control/wallet' },
  { id: 'transactions', label: 'Transactions', icon: Receipt, to: '/admin-control/transactions' },
  { id: 'support', label: 'Support & Tickets', icon: LifeBuoy, to: null },
  { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, to: null },
  { id: 'jobs', label: 'Job Management', icon: ClipboardList, to: null },
];
