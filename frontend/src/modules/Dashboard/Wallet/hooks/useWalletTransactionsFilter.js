import { useMemo, useState } from 'react';
import { normalizeTransactions } from '../utils/walletTransactionMapper';

const PAGE_SIZE = 8;

function inDateRange(iso, from, to) {
  if (!iso) return true;
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return true;
  if (from) {
    const fromTime = new Date(from).setHours(0, 0, 0, 0);
    if (time < fromTime) return false;
  }
  if (to) {
    const toTime = new Date(to).setHours(23, 59, 59, 999);
    if (time > toTime) return false;
  }
  return true;
}

export default function useWalletTransactionsFilter(transactions, fallbackRows) {
  const [query, setQuery] = useState('');
  const [typeTab, setTypeTab] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);

  const allRows = useMemo(
    () => normalizeTransactions(transactions, fallbackRows),
    [transactions, fallbackRows],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allRows.filter((tx) => {
      if (typeTab === 'income' && tx.type !== 'income') return false;
      if (typeTab === 'expenses' && tx.type !== 'expenses') return false;
      if (typeTab === 'pending' && tx.status !== 'pending') return false;
      if (typeTab === 'withdrawals' && tx.type !== 'withdrawals') return false;
      if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
      if (!inDateRange(tx.at, dateFrom, dateTo)) return false;
      if (!q) return true;
      return `${tx.title} ${tx.subtitle}`.toLowerCase().includes(q);
    });
  }, [allRows, query, typeTab, statusFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const pageRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);

  const resetPage = () => setPage(1);

  return {
    query,
    setQuery,
    typeTab,
    setTypeTab: (tab) => { setTypeTab(tab); resetPage(); },
    statusFilter,
    setStatusFilter: (value) => { setStatusFilter(value); resetPage(); },
    dateFrom,
    setDateFrom: (value) => { setDateFrom(value); resetPage(); },
    dateTo,
    setDateTo: (value) => { setDateTo(value); resetPage(); },
    page: safePage,
    setPage,
    totalPages,
    filtered,
    pageRows,
    totalCount: filtered.length,
    pageSize: PAGE_SIZE,
  };
}
