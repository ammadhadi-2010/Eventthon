import {
  FiCreditCard, FiDollarSign, FiSmartphone,
} from 'react-icons/fi';

export const TOP_UP_METHODS = [
  { id: 'card', label: 'Debit / Credit Card', detail: 'Visa, Mastercard', icon: FiCreditCard, fee: '2.5%' },
  { id: 'easypaisa', label: 'EasyPaisa', detail: 'Mobile wallet top-up', icon: FiSmartphone, fee: '1.5%' },
  { id: 'jazzcash', label: 'JazzCash', detail: 'Mobile wallet top-up', icon: FiSmartphone, fee: '1.5%' },
  { id: 'bank', label: 'Bank Transfer', detail: 'HBL, Meezan, UBL', icon: FiDollarSign, fee: '0%' },
];

export const TOP_UP_PRESETS_USD = [5, 10, 25, 50, 100];

export const DEMO_TOP_UPS = [
  { id: 'tu1', method: 'EasyPaisa', amount: 1000, status: 'completed', at: '2025-06-11T10:00:00Z' },
  { id: 'tu2', method: 'Bank Transfer', amount: 5000, status: 'completed', at: '2025-06-05T14:20:00Z' },
  { id: 'tu3', method: 'Card', amount: 500, status: 'pending', at: '2025-06-03T09:15:00Z' },
];

export const DEMO_SENT_TRANSFERS = [
  { id: 's1', to: 'Sara Khan', amount: -350, status: 'completed', at: '2025-06-10T16:00:00Z' },
  { id: 's2', to: 'Dev Squad Treasury', amount: -1200, status: 'completed', at: '2025-06-08T11:30:00Z' },
  { id: 's3', to: 'Ali Raza', amount: -200, status: 'pending', at: '2025-06-06T08:45:00Z' },
];

export const DEMO_PAYMENT_REQUESTS = [
  { id: 'pr1', title: 'Logo Design Milestone', amount: 1500, to: 'client@brandco.com', status: 'pending', at: '2025-06-11T12:00:00Z' },
  { id: 'pr2', title: 'Event Booth Deposit', amount: 800, to: 'events@startup.pk', status: 'paid', at: '2025-06-09T09:00:00Z' },
  { id: 'pr3', title: 'Gig Final Payment', amount: 2200, to: 'hire@agency.io', status: 'expired', at: '2025-06-01T18:00:00Z' },
];

export function buildWalletReceiveLink(address) {
  const clean = String(address || '0xeventthon').trim();
  return `https://eventthon.com/pay/${encodeURIComponent(clean)}`;
}

export function buildPaymentRequestLink(requestId) {
  return `https://eventthon.com/wallet/request/${requestId}`;
}
