import React from 'react';
import { FiArrowLeft } from 'react-icons/fi';

const COPY = {
  transactions: {
    title: 'All Transactions',
    body: 'Full transaction history with filters and export will appear here.',
  },
  withdraw: {
    title: 'Withdraw Thon',
    body: 'Connect your bank account and request withdrawals from your withdrawable balance.',
  },
  rewards: {
    title: 'Thon Rewards',
    body: 'Track referral bonuses, streak rewards, and loyalty perks.',
  },
  settings: {
    title: 'Wallet Settings',
    body: 'Manage security, notifications, and display preferences for your Thon wallet.',
  },
  'add-balance': {
    title: 'Add Balance',
    body: 'Top up your Thon wallet using supported payment methods.',
  },
  send: {
    title: 'Send Thon',
    body: 'Transfer Thon to other EventThon members instantly.',
  },
  receive: {
    title: 'Receive Thon',
    body: 'Share your wallet address or QR code to receive Thon.',
  },
  'payment-request': {
    title: 'Payment Request',
    body: 'Send a payment request link to clients or collaborators.',
  },
};

export default function WalletSectionPlaceholder({ section, onBack }) {
  const meta = COPY[section] || { title: 'Wallet', body: 'This section is coming soon.' };

  return (
    <section className="wallet-card wallet-placeholder">
      <button type="button" className="wallet-placeholder__back" onClick={onBack}>
        <FiArrowLeft size={16} aria-hidden />
        Back to Wallet
      </button>
      <h2>{meta.title}</h2>
      <p>{meta.body}</p>
    </section>
  );
}
