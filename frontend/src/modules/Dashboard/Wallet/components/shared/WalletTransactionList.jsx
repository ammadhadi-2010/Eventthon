import React from 'react';
import { FiCreditCard } from 'react-icons/fi';
import { formatThonAmount, formatTxDate } from '../../utils/walletFormatters';
import { getWalletRowShade } from '../../utils/walletCardShades';
import { statusLabel } from '../../utils/walletTransactionMapper';

export default function WalletTransactionRow({ tx, index = 0 }) {
  const shade = getWalletRowShade(index);
  const positive = Number(tx.amount) >= 0;
  const Icon = tx.icon || FiCreditCard;

  return (
    <li className={`wallet-tx-row wallet-tx-row--${shade}`}>
      <span className={`wallet-tx-row__icon wallet-tx-row__icon--${shade}`}>
        <Icon size={16} />
      </span>
      <div className="wallet-tx-row__main">
        <strong>{tx.title}</strong>
        <span>{tx.subtitle}</span>
        <small>{formatTxDate(tx.at)}</small>
      </div>
      <div className="wallet-tx-row__meta">
        <span className={`wallet-tx-badge wallet-tx-badge--${tx.status}`}>{statusLabel(tx)}</span>
        <strong className={positive ? 'wallet-tx-amount--pos' : 'wallet-tx-amount--neg'}>
          {formatThonAmount(tx.amount, { signed: true })}
        </strong>
      </div>
    </li>
  );
}

export function WalletTransactionList({ rows }) {
  if (!rows.length) {
    return <p className="wallet-empty-note">No transactions match your filters.</p>;
  }
  return (
    <ul className="wallet-tx-list">
      {rows.map((tx, index) => (
        <WalletTransactionRow key={tx.id} tx={tx} index={index} />
      ))}
    </ul>
  );
}
