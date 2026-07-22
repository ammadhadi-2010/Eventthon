import { FiCreditCard } from 'react-icons/fi';

export function mapApiTransaction(row) {
  const amount = Number(row?.amount) || 0;
  const type = String(row?.type || '').toLowerCase();
  const status = String(row?.status || '').toLowerCase();
  const isExpense = amount < 0 || type.includes('withdraw') || type.includes('debit') || type.includes('expense');
  const isPending = status === 'pending';
  const isFailed = status === 'failed';
  const isWithdrawal = type.includes('withdraw');

  let filterType = 'income';
  if (isWithdrawal) filterType = 'withdrawals';
  else if (isPending) filterType = 'pending';
  else if (isExpense) filterType = 'expenses';

  let uiStatus = 'completed';
  if (isFailed) uiStatus = 'failed';
  else if (isExpense) uiStatus = 'expense';
  else if (isPending) uiStatus = 'pending';

  return {
    id: row?.id || row?._id || `${row?.created_at}-${amount}`,
    title: row?.note || row?.type || 'Transaction',
    subtitle: row?.meta?.source || row?.currency || 'Thon Wallet',
    amount,
    type: filterType,
    status: uiStatus,
    icon: row?.icon || FiCreditCard,
    at: row?.created_at,
  };
}

export function normalizeTransactions(transactions = [], fallback = []) {
  if (transactions?.length) return transactions.map(mapApiTransaction);
  return fallback;
}

export function statusLabel(tx) {
  if (tx.status === 'expense') return 'Expense';
  if (tx.status === 'pending') return 'Pending';
  if (tx.status === 'failed') return 'Failed';
  return 'Completed';
}
