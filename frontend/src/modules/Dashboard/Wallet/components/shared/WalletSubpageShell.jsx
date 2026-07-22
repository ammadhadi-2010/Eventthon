import React from 'react';
import { FiArrowLeft } from 'react-icons/fi';

export default function WalletSubpageShell({ onBack, children }) {
  return (
    <div className="wallet-subpage-stack">
      <button type="button" className="wallet-placeholder__back wallet-subpage-back" onClick={onBack}>
        <FiArrowLeft size={16} aria-hidden />
        Back to Wallet
      </button>
      {children}
    </div>
  );
}
