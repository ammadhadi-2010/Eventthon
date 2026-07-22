import React from 'react';
import { Link } from 'react-router-dom';
import { FiCreditCard } from 'react-icons/fi';
import { BusinessIcon, BUSINESS_LOTTIE } from '../../../components/lottie';
import './wallet-card.css';

function formatCoinBalance(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '0.0';
  return amount.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function formatUsdEstimate(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '0.00';
  return (amount / 100).toFixed(2);
}

const WalletCard = ({ userData }) => {
  const balance = userData?.wallet_balance ?? 12560;

  return (
    <section className="wallet-card" aria-label="Earning wallet">
      <div className="wallet-card__head">
        <BusinessIcon src={BUSINESS_LOTTIE.wallet} size={28} label="Wallet balance animation" />
        <h4 className="wallet-card__title">Earning Wallet</h4>
        <Link to="/wallet" className="wallet-card__open-link">Open</Link>
      </div>

      <div className="wallet-card__balance-row">
        <span className="wallet-card__amount">{formatCoinBalance(balance)}</span>
        <span className="wallet-card__coins">ET</span>
      </div>
      <p className="wallet-card__usd">≈ ${formatUsdEstimate(balance)} USD</p>

      <div className="wallet-card__growth">
        <BusinessIcon src={BUSINESS_LOTTIE.growth} size={20} label="Monthly growth animation" />
        <span>Monthly Growth: +18.6%</span>
      </div>

      <Link to="/wallet" className="wallet-card__withdraw">
        <FiCreditCard size={14} aria-hidden />
        My Wallet
      </Link>
    </section>
  );
};

export default WalletCard;
