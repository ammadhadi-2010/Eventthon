import React from 'react';
import { FiMoreHorizontal, FiPlus } from 'react-icons/fi';

export default function WalletHeader({ onNavigate, onWithdraw }) {
  return (
    <header className="wallet-header">
      <div className="wallet-header__row">
        <h1 className="wallet-header__title">My Wallet</h1>
        <div className="wallet-header__actions">
          <button
            type="button"
            className="wallet-btn wallet-btn--primary wallet-btn--header-add"
            onClick={() => onNavigate?.('add-balance')}
          >
            <FiPlus size={16} aria-hidden />
            <span className="wallet-btn__label">Add Balance</span>
          </button>
          <button type="button" className="wallet-btn wallet-btn--outline wallet-btn--header-withdraw" onClick={onWithdraw}>
            <span className="wallet-btn__label">Withdraw</span>
          </button>
          <button type="button" className="wallet-btn wallet-btn--ghost wallet-btn--header-more" aria-label="More options">
            <FiMoreHorizontal size={18} />
          </button>
        </div>
      </div>
      <p className="wallet-header__subtitle wallet-header__status">Under Process</p>
    </header>
  );
}
