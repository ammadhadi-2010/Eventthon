import React from 'react';
import { FOOTER_FEATURES } from '../data/walletDemoData';

export default function WalletFooterBanner() {
  return (
    <section className="wallet-footer-banner" aria-label="Thon Wallet across EventThon">
      <div className="wallet-footer-banner__copy">
        <h3>Use Thon Wallet Across EventThon</h3>
        <p>Pay freelancers, book events, boost content, and unlock premium features with Thon.</p>
        <div className="wallet-footer-features">
          {FOOTER_FEATURES.map(({ label, icon: Icon }) => (
            <div key={label} className="wallet-footer-feature">
              <span className="wallet-footer-feature__icon"><Icon size={16} /></span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="wallet-footer-banner__art" aria-hidden>
        <div className="wallet-footer-wallet">💳</div>
        <div className="wallet-footer-coin wallet-footer-coin--1">Thon</div>
        <div className="wallet-footer-coin wallet-footer-coin--2">Thon</div>
        <div className="wallet-footer-coin wallet-footer-coin--3">Thon</div>
      </div>
    </section>
  );
}
