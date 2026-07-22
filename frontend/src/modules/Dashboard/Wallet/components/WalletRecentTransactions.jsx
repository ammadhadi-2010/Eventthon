import React, { useMemo, useState } from 'react';
import { DEMO_TRANSACTIONS, TX_FILTERS } from '../data/walletDemoData';
import { normalizeTransactions } from '../utils/walletTransactionMapper';
import { WalletTransactionList } from './shared/WalletTransactionList';

export default function WalletRecentTransactions({ transactions = [], onViewAll }) {
  const [filter, setFilter] = useState('all');

  const allRows = useMemo(
    () => normalizeTransactions(transactions, DEMO_TRANSACTIONS),
    [transactions],
  );

  const rows = useMemo(() => {
    if (filter === 'all') return allRows.slice(0, 6);
    return allRows.filter((tx) => tx.type === filter).slice(0, 6);
  }, [allRows, filter]);

  return (
    <section className="wallet-card wallet-transactions">
      <div className="wallet-transactions__head">
        <h3>Recent Transactions</h3>
        <div className="wallet-tx-tabs" role="tablist" aria-label="Transaction filters">
          {TX_FILTERS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={filter === tab.id}
              className={`wallet-tx-tab${filter === tab.id ? ' is-active' : ''}`}
              onClick={() => setFilter(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <WalletTransactionList rows={rows} />

      <button type="button" className="wallet-view-all-btn" onClick={onViewAll}>
        View All Transactions
      </button>
    </section>
  );
}
