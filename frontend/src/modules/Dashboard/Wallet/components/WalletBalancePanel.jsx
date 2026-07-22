import React from 'react';
import { FiBarChart2, FiClock, FiLock, FiTrendingUp } from 'react-icons/fi';
import { DEFAULT_SUMMARY } from '../data/walletDemoData';
import { formatThonAmount, formatUsdFromThon, resolveThonBalances } from '../utils/walletFormatters';

function DonutChart({ income, expenses, growth }) {
  const total = income + expenses;
  const incomePct = total > 0 ? (income / total) * 100 : 60;
  const expensesPct = 100 - incomePct;
  const net = income - expenses;

  return (
    <div className="wallet-donut-wrap">
      <svg className="wallet-donut" viewBox="0 0 120 120" aria-hidden>
        <circle cx="60" cy="60" r="46" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" />
        <circle
          cx="60" cy="60" r="46" fill="none" stroke="#22c55e" strokeWidth="14"
          strokeDasharray={`${incomePct * 2.89} 289`}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
        />
        <circle
          cx="60" cy="60" r="46" fill="none" stroke="#ef4444" strokeWidth="14"
          strokeDasharray={`${expensesPct * 2.89} 289`}
          strokeDashoffset={`-${incomePct * 2.89}`}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div className="wallet-donut-center">
        <strong>+{growth}%</strong>
        <span>Growth</span>
      </div>
      <div className="wallet-donut-legend">
        <div><span className="wallet-dot wallet-dot--green" />Income <strong>{formatThonAmount(income)}</strong></div>
        <div><span className="wallet-dot wallet-dot--red" />Expenses <strong>{formatThonAmount(expenses)}</strong></div>
        <div className="wallet-donut-net">Net Income: <strong>{formatThonAmount(net, { signed: true })}</strong></div>
      </div>
    </div>
  );
}

export default function WalletBalancePanel({ wallet, loading, summary = DEFAULT_SUMMARY }) {
  const { available, pending, locked, withdrawable } = resolveThonBalances(wallet);
  const displayAvailable = available || 12560;
  const displayPending = pending || 2300;
  const displayLocked = locked || 1000;
  const displayWithdrawable = withdrawable || Math.max(0, displayAvailable - displayLocked);

  return (
    <section className="wallet-balance-grid" aria-label="Wallet balance overview">
      <article className="wallet-card wallet-balance-main">
        <p className="wallet-balance-label">Available Balance</p>
        <h2 className="wallet-balance-amount">{loading ? '…' : formatThonAmount(displayAvailable)}</h2>
        <p className="wallet-balance-usd">≈ ${formatUsdFromThon(displayAvailable)} USD</p>
        <button type="button" className="wallet-overview-btn">
          <FiBarChart2 size={14} aria-hidden />
          Wallet Overview
        </button>
      </article>

      <article className="wallet-card wallet-balance-stats">
        <div className="wallet-stat-row">
          <span className="wallet-stat-icon wallet-stat-icon--pending"><FiClock size={14} /></span>
          <div><span>Pending</span><strong>{formatThonAmount(displayPending)}</strong></div>
        </div>
        <div className="wallet-stat-row">
          <span className="wallet-stat-icon wallet-stat-icon--locked"><FiLock size={14} /></span>
          <div><span>Locked</span><strong>{formatThonAmount(displayLocked)}</strong></div>
        </div>
        <div className="wallet-stat-row">
          <span className="wallet-stat-icon wallet-stat-icon--withdraw"><FiTrendingUp size={14} /></span>
          <div><span>Withdrawable</span><strong>{formatThonAmount(displayWithdrawable)}</strong></div>
        </div>
      </article>

      <article className="wallet-card wallet-balance-chart">
        <p className="wallet-balance-label">Income vs Expenses</p>
        <DonutChart income={summary.income} expenses={summary.expenses} growth={summary.growth} />
      </article>
    </section>
  );
}
