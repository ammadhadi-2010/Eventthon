import React from 'react';
import { FiCreditCard } from 'react-icons/fi';
import { BusinessIcon, BUSINESS_LOTTIE } from '../../../components/lottie';
import './wallet-card.css';

function formatCoinBalance(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '0.0';
  return amount.toFixed(1);
}

function formatUsdEstimate(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '0.00';
  return (amount / 100).toFixed(2);
}

const WalletCard = ({ userData }) => {
  const balance = userData?.wallet_balance ?? 0;

  return (
    <section className="wallet-card wallet-card--soon" aria-label="Earning wallet">
      <div className="wallet-card__head">
        <BusinessIcon src={BUSINESS_LOTTIE.wallet} size={28} label="Wallet balance animation" />
        <h4 className="wallet-card__title">Earning Wallet</h4>
        <span className="wallet-card__soon-badge">Coming Soon</span>
      </div>

      <div className="wallet-card__balance-row">
        <span className="wallet-card__amount">{formatCoinBalance(balance)}</span>
        <span className="wallet-card__coins">Coins</span>
      </div>
      <p className="wallet-card__usd">~${formatUsdEstimate(balance)} USD</p>

      <div className="wallet-card__growth">
        <BusinessIcon src={BUSINESS_LOTTIE.growth} size={20} label="Monthly growth animation" />
        <span>Monthly Growth: +12%</span>
      </div>

      <button type="button" className="wallet-card__withdraw" disabled>
        <FiCreditCard size={14} aria-hidden />
        Coming Soon
      </button>
    </section>
  );
};

export default WalletCard;
