import React from 'react';
import { Link } from 'react-router-dom';
import { FiCreditCard, FiSettings, FiTrendingDown, FiTrendingUp } from 'react-icons/fi';
import { WALLET_MENU } from '../data/walletDemoData';

const MENU_ICONS = {
  wallet: FiCreditCard,
  transactions: FiTrendingUp,
  withdraw: FiTrendingDown,
  rewards: FiTrendingUp,
  settings: FiSettings,
};

export default function WalletLeftSidebar({ activeSection, onSectionSelect }) {
  return (
    <aside className="wallet-left-stack">
      <div className="wallet-card wallet-left-card">
        <p className="wallet-left-title">Wallet Menu</p>
        <nav className="wallet-left-menu" aria-label="Wallet navigation">
          {WALLET_MENU.map((item) => {
            const Icon = MENU_ICONS[item.id] || FiCreditCard;
            return (
              <button
                key={item.id}
                type="button"
                className={`wallet-left-menu-item${activeSection === item.id ? ' is-active' : ''}`}
                onClick={() => onSectionSelect(item.id)}
              >
                <span className="wallet-left-icon"><Icon size={14} /></span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="wallet-card wallet-left-card wallet-left-promo">
        <h4>Secure Your Thon Wallet</h4>
        <p>Enable two-factor authentication and withdrawal PIN for extra protection.</p>
        <button type="button" className="wallet-left-promo-btn" onClick={() => onSectionSelect('settings')}>
          Manage Security
        </button>
      </div>

      <div className="wallet-card wallet-left-card wallet-left-pro">
        <span className="wallet-left-pro-badge">Pro</span>
        <h4>Upgrade to Pro</h4>
        <p>Lower fees, faster withdrawals, and premium wallet analytics.</p>
        <Link to="/profile" className="wallet-left-pro-link">Learn More</Link>
      </div>
    </aside>
  );
}
