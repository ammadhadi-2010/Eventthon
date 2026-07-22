import {
  FiAward, FiCalendar, FiCreditCard, FiDollarSign, FiGift, FiLayers,
  FiShoppingBag, FiSmartphone, FiStar, FiTrendingDown, FiTrendingUp, FiUsers, FiZap,
} from 'react-icons/fi';

export const ALL_DEMO_TRANSACTIONS = [
  { id: 't1', title: 'Project Payment Received', subtitle: 'SEO Dashboard Development', amount: 2500, type: 'income', status: 'completed', icon: FiLayers, at: '2025-06-12T14:32:00Z' },
  { id: 't2', title: 'Gig Payment Received', subtitle: 'Logo Design Package', amount: 1200, type: 'income', status: 'completed', icon: FiStar, at: '2025-06-11T09:15:00Z' },
  { id: 't3', title: 'Event Ticket Sale', subtitle: 'Tech Summit 2025', amount: 850, type: 'income', status: 'completed', icon: FiCalendar, at: '2025-06-10T18:45:00Z' },
  { id: 't4', title: 'Boosted Post', subtitle: 'Project Launch Promotion', amount: -300, type: 'expense', status: 'expense', icon: FiTrendingUp, at: '2025-06-09T11:20:00Z' },
  { id: 't5', title: 'Premium Membership', subtitle: 'Pro Plan Subscription', amount: -500, type: 'expense', status: 'expense', icon: FiAward, at: '2025-06-08T08:00:00Z' },
  { id: 't6', title: 'Referral Bonus', subtitle: 'New User Signup', amount: 150, type: 'income', status: 'completed', icon: FiGift, at: '2025-06-07T16:30:00Z' },
  { id: 't7', title: 'Withdrawal to Bank', subtitle: 'HBL •••• 4821', amount: -2000, type: 'withdrawals', status: 'completed', icon: FiTrendingDown, at: '2025-06-06T12:00:00Z' },
  { id: 't8', title: 'Marketplace Sale', subtitle: 'UI Kit Bundle', amount: 640, type: 'income', status: 'completed', icon: FiShoppingBag, at: '2025-06-05T10:22:00Z' },
  { id: 't9', title: 'AI Credits Purchase', subtitle: 'Content Assistant Pack', amount: -350, type: 'expense', status: 'expense', icon: FiZap, at: '2025-06-04T15:40:00Z' },
  { id: 't10', title: 'Pending Gig Escrow', subtitle: 'Mobile App MVP', amount: 1800, type: 'pending', status: 'pending', icon: FiStar, at: '2025-06-03T08:10:00Z' },
  { id: 't11', title: 'Withdrawal Failed', subtitle: 'JazzCash •••• 9012', amount: -500, type: 'withdrawals', status: 'failed', icon: FiSmartphone, at: '2025-06-02T19:05:00Z' },
  { id: 't12', title: 'Squad Reward', subtitle: 'Weekly Challenge', amount: 220, type: 'income', status: 'completed', icon: FiUsers, at: '2025-06-01T21:18:00Z' },
];

export const TX_TYPE_TABS = [
  { id: 'all', label: 'All' },
  { id: 'income', label: 'Income' },
  { id: 'expenses', label: 'Expenses' },
  { id: 'pending', label: 'Pending' },
  { id: 'withdrawals', label: 'Withdrawals' },
];

export const TX_STATUS_OPTIONS = [
  { id: 'all', label: 'All Status' },
  { id: 'completed', label: 'Completed' },
  { id: 'pending', label: 'Pending' },
  { id: 'failed', label: 'Failed' },
  { id: 'expense', label: 'Expense' },
];

export const DEMO_PAYMENT_ACCOUNTS = [
  { id: 'bank-1', type: 'bank', label: 'HBL Bank', detail: '•••• 4821', holder: 'Ammad Ul Hadi', primary: true },
  { id: 'ep-1', type: 'easypaisa', label: 'EasyPaisa', detail: '03xx •••• 9012', holder: 'Ammad Ul Hadi', primary: false },
  { id: 'jc-1', type: 'jazzcash', label: 'JazzCash', detail: '03xx •••• 3344', holder: 'Ammad Ul Hadi', primary: false },
];

export const DEMO_WITHDRAWALS = [
  { id: 'w1', amount: 2000, method: 'HBL Bank', status: 'completed', at: '2025-06-06T12:00:00Z' },
  { id: 'w2', amount: 1500, method: 'EasyPaisa', status: 'pending', at: '2025-06-04T09:30:00Z' },
  { id: 'w3', amount: 500, method: 'JazzCash', status: 'failed', at: '2025-06-02T19:05:00Z' },
];

export const DEMO_REWARDS = {
  balance: 2450,
  daily: { claimed: false, amount: 50, streak: 5 },
  weekly: { title: 'Complete 3 Gigs', progress: 66, reward: 300, deadline: 'Sunday' },
  badges: [
    { id: 'b1', label: 'First Withdrawal', earned: true, icon: FiDollarSign },
    { id: 'b2', label: 'Top Seller', earned: true, icon: FiStar },
    { id: 'b3', label: 'Event Host', earned: false, icon: FiCalendar },
    { id: 'b4', label: 'Referral Pro', earned: true, icon: FiUsers },
  ],
  history: [
    { id: 'r1', label: 'Daily Login Bonus', amount: 50, at: '2025-06-12T08:00:00Z' },
    { id: 'r2', label: 'Weekly Challenge', amount: 300, at: '2025-06-09T20:00:00Z' },
    { id: 'r3', label: 'Referral Milestone', amount: 150, at: '2025-06-05T14:00:00Z' },
  ],
  redeem: [
    { id: 's1', label: 'Boost Post Credit', cost: 200, icon: FiTrendingUp },
    { id: 's2', label: 'AI Credits Pack', cost: 350, icon: FiZap },
    { id: 's3', label: 'Pro Trial (7 days)', cost: 500, icon: FiAward },
  ],
  upcoming: [
    { id: 'u1', label: 'Weekend Bonus', eta: '2 days', amount: 120 },
    { id: 'u2', label: 'Squad Milestone', eta: '5 days', amount: 400 },
  ],
};

export const DEMO_DEVICES = [
  { id: 'd1', name: 'Windows Desktop', location: 'Lahore, PK', lastActive: 'Active now', current: true },
  { id: 'd2', name: 'iPhone 14', location: 'Karachi, PK', lastActive: '2 days ago', current: false },
];

export const DEMO_LOGIN_HISTORY = [
  { id: 'l1', device: 'Windows Desktop', ip: '192.168.*.*', at: '2025-06-12T09:00:00Z', status: 'success' },
  { id: 'l2', device: 'iPhone 14', ip: '10.0.*.*', at: '2025-06-10T18:22:00Z', status: 'success' },
  { id: 'l3', device: 'Unknown Device', ip: '45.***.***.***', at: '2025-06-08T03:11:00Z', status: 'blocked' },
];
