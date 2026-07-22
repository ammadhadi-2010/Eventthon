import React from 'react';
import { FiShield } from 'react-icons/fi';
import { INCOME_SOURCES, SPENDING_CATEGORIES } from '../data/walletDemoData';
import { formatThonAmount } from '../utils/walletFormatters';
import { getWalletRowShade } from '../utils/walletCardShades';

function SourceList({ title, rows, positive }) {
  return (
    <section className="wallet-card wallet-side-panel">
      <h4>{title}</h4>
      <ul className="wallet-side-list">
        {rows.map((row, index) => {
          const shade = getWalletRowShade(index);
          const Icon = row.icon;
          return (
            <li key={row.label} className={`wallet-side-row wallet-side-row--${shade}`}>
              <span className={`wallet-side-row__icon wallet-side-row__icon--${shade}`}>
                <Icon size={14} />
              </span>
              <span>{row.label}</span>
              <strong className={positive ? 'wallet-tx-amount--pos' : 'wallet-tx-amount--neg'}>
                {formatThonAmount(row.amount, { signed: true })}
              </strong>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default function WalletRightSidebar({ security, onManageSecurity }) {
  const twoFactor = security?.two_factor_enabled;

  return (
    <aside className="wallet-right-stack">
      <SourceList title="Income Sources" rows={INCOME_SOURCES} positive />
      <SourceList title="Spending Categories" rows={SPENDING_CATEGORIES} positive={false} />

      <section className="wallet-card wallet-security-card">
        <span className="wallet-security-icon"><FiShield size={22} /></span>
        <h4>Wallet Security</h4>
        <p>
          {twoFactor
            ? 'Two-factor authentication is enabled. Your wallet is protected.'
            : 'Enable two-factor authentication to keep your Thon wallet secure.'}
        </p>
        <button type="button" className="wallet-security-btn" onClick={onManageSecurity}>
          Manage Security
        </button>
      </section>
    </aside>
  );
}
