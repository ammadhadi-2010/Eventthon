import React from 'react';
import { ALL_DEMO_TRANSACTIONS } from '../data/walletSubpagesData';
import useWalletTransactionsFilter from '../hooks/useWalletTransactionsFilter';
import WalletSubpageHeader from '../components/shared/WalletSubpageHeader';
import { WalletTransactionList } from '../components/shared/WalletTransactionList';
import WalletPagination from '../components/shared/WalletPagination';
import WalletTransactionsToolbar from '../components/transactions/WalletTransactionsToolbar';

export default function WalletTransactionsPage({ transactions = [] }) {
  const filter = useWalletTransactionsFilter(transactions, ALL_DEMO_TRANSACTIONS);

  return (
    <div className="wallet-subpage-stack">
      <WalletSubpageHeader
        title="All Transactions"
        subtitle="Search, filter, and export your Thon wallet activity"
      />
      <WalletTransactionsToolbar {...filter} rows={filter.filtered} />
      <section className="wallet-card wallet-transactions wallet-transactions--full">
        <WalletTransactionList rows={filter.pageRows} />
        <WalletPagination
          page={filter.page}
          totalPages={filter.totalPages}
          totalCount={filter.totalCount}
          pageSize={filter.pageSize}
          setPage={filter.setPage}
        />
      </section>
    </div>
  );
}
