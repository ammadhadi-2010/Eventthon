import React from 'react';
import { FiArrowLeft, FiClock } from 'react-icons/fi';

const SECTION_TITLES = {
  transactions: 'Transactions',
  withdraw: 'Withdraw',
  rewards: 'Rewards',
  settings: 'Settings',
  'add-balance': 'Add Balance',
  send: 'Send Thon',
  receive: 'Receive Thon',
  'payment-request': 'Payment Request',
};

export default function WalletComingSoon({ section = 'wallet', onBack }) {
  const title = SECTION_TITLES[section] || 'Wallet';

  return (
    <section className="wallet-card wallet-coming-soon">
      <button type="button" className="wallet-placeholder__back" onClick={onBack}>
        <FiArrowLeft size={16} aria-hidden />
        Back to Wallet
      </button>
      <span className="wallet-coming-soon__icon" aria-hidden>
        <FiClock size={28} />
      </span>
      <h2>{title}</h2>
      <p className="wallet-coming-soon__badge">Coming Soon</p>
      <p className="wallet-coming-soon__note">This feature is being prepared for EventThon Wallet.</p>
    </section>
  );
}
