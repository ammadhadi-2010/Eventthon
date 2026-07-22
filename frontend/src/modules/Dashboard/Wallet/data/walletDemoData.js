import {
  FiAward, FiCalendar, FiCreditCard, FiGift, FiLayers, FiShoppingBag,
  FiStar, FiTrendingUp, FiUsers, FiZap,
} from 'react-icons/fi';

export const WALLET_MENU = [
  { id: 'wallet', label: 'Wallet' },
  { id: 'transactions', label: 'Transactions' },
  { id: 'withdraw', label: 'Withdraw' },
  { id: 'rewards', label: 'Rewards' },
  { id: 'settings', label: 'Settings' },
];

export const TX_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'income', label: 'Income' },
  { id: 'expenses', label: 'Expenses' },
  { id: 'pending', label: 'Pending' },
  { id: 'withdrawals', label: 'Withdrawals' },
];

export const DEMO_TRANSACTIONS = [
  { id: 't1', title: 'Project Payment Received', subtitle: 'SEO Dashboard Development', amount: 2500, type: 'income', status: 'completed', icon: FiLayers, at: '2025-06-12T14:32:00Z' },
  { id: 't2', title: 'Gig Payment Received', subtitle: 'Logo Design Package', amount: 1200, type: 'income', status: 'completed', icon: FiStar, at: '2025-06-11T09:15:00Z' },
  { id: 't3', title: 'Event Ticket Sale', subtitle: 'Tech Summit 2025', amount: 850, type: 'income', status: 'completed', icon: FiCalendar, at: '2025-06-10T18:45:00Z' },
  { id: 't4', title: 'Boosted Post', subtitle: 'Project Launch Promotion', amount: -300, type: 'expense', status: 'expense', icon: FiTrendingUp, at: '2025-06-09T11:20:00Z' },
  { id: 't5', title: 'Premium Membership', subtitle: 'Pro Plan Subscription', amount: -500, type: 'expense', status: 'expense', icon: FiAward, at: '2025-06-08T08:00:00Z' },
  { id: 't6', title: 'Referral Bonus', subtitle: 'New User Signup', amount: 150, type: 'income', status: 'completed', icon: FiGift, at: '2025-06-07T16:30:00Z' },
];

export const INCOME_SOURCES = [
  { label: 'Projects', amount: 8500, icon: FiLayers },
  { label: 'Gigs', amount: 4200, icon: FiStar },
  { label: 'Event Tickets', amount: 2100, icon: FiCalendar },
  { label: 'Marketplace', amount: 1800, icon: FiShoppingBag },
  { label: 'Referrals', amount: 850, icon: FiUsers },
];

export const SPENDING_CATEGORIES = [
  { label: 'Boost Posts', amount: -1200, icon: FiTrendingUp },
  { label: 'Premium Membership', amount: -500, icon: FiAward },
  { label: 'AI Credits', amount: -350, icon: FiZap },
  { label: 'Marketplace Purchases', amount: -280, icon: FiShoppingBag },
  { label: 'Event Tickets', amount: -150, icon: FiCalendar },
];

export const QUICK_ACTIONS = [
  { id: 'add', label: 'Add Balance', color: '#7c3aed', target: 'add-balance' },
  { id: 'send', label: 'Send Thon', color: '#3b82f6', target: 'send' },
  { id: 'receive', label: 'Receive Thon', color: '#10b981', target: 'receive' },
  { id: 'withdraw', label: 'Withdraw', color: '#f59e0b', target: 'withdraw' },
  { id: 'transactions', label: 'Transactions', color: '#6366f1', target: 'transactions' },
  { id: 'request', label: 'Payment Request', color: '#14b8a6', target: 'payment-request' },
];

export const FOOTER_FEATURES = [
  { label: 'Pay Freelancers', icon: FiUsers },
  { label: 'Book Events', icon: FiCalendar },
  { label: 'Marketplace', icon: FiShoppingBag },
  { label: 'Boost Content', icon: FiTrendingUp },
  { label: 'Premium Features', icon: FiAward },
  { label: 'Donate & Support', icon: FiGift },
];

export const DEFAULT_SUMMARY = {
  income: 18450,
  expenses: 7320,
  growth: 18.6,
};
