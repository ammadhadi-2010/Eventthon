import React from 'react';
import { Link } from 'react-router-dom';
import { FiClock, FiCreditCard } from 'react-icons/fi';
import './wallet-coming-soon.css';

export default function WalletComingSoon() {
  return (
    <section className="wallet-coming-soon">
      <div className="wallet-coming-soon__card">
        <span className="wallet-coming-soon__icon" aria-hidden>
          <FiCreditCard size={28} />
        </span>
        <p className="wallet-coming-soon__badge">Coming Soon</p>
        <h1>Wallet</h1>
        <p className="wallet-coming-soon__copy">
          ET Coin balance, withdrawals, and finance tools are on the way. Your gigs and earnings stay active in the meantime.
        </p>
        <Link to="/dashboard" className="wallet-coming-soon__back">
          Back to Dashboard
        </Link>
      </div>
      <span className="wallet-coming-soon__clock" aria-hidden>
        <FiClock size={16} />
      </span>
    </section>
  );
}
