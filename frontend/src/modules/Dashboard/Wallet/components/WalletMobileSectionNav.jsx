import React from 'react';
import { WALLET_MENU } from '../data/walletDemoData';

export default function WalletMobileSectionNav({ activeSection, onSectionSelect }) {
  return (
    <nav className="wallet-mobile-section-nav" aria-label="Wallet sections">
      {WALLET_MENU.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`wallet-mobile-section-nav__item${activeSection === item.id ? ' is-active' : ''}`}
          onClick={() => onSectionSelect(item.id)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
