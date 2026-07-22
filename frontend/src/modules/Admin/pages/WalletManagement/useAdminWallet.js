import { useCallback, useEffect, useState } from 'react';
import {
  fetchAdminWalletTransactions,
  fetchPendingDeposits,
  fetchUserWalletAdmin,
  fetchWalletStats,
  settleBatch,
  settleDeposit,
} from '../../../../services/adminWalletService';

export default function useAdminWallet() {
  const [stats, setStats] = useState(null);
  const [pendingRows, setPendingRows] = useState([]);
  const [txRows, setTxRows] = useState([]);
  const [lookup, setLookup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const loadCore = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, pending, txs] = await Promise.all([
        fetchWalletStats(),
        fetchPendingDeposits(100),
        fetchAdminWalletTransactions({ limit: 150 }),
      ]);
      setStats(statsData);
      setPendingRows(pending);
      setTxRows(txs);
      setError('');
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCore();
  }, [loadCore]);

  const lookupUser = useCallback(async (userId) => {
    const clean = String(userId || '').trim();
    if (!clean) {
      setLookup(null);
      return null;
    }
    setActionLoading(true);
    try {
      const data = await fetchUserWalletAdmin(clean);
      setLookup(data);
      setError('');
      return data;
    } catch (err) {
      setLookup(null);
      setError(err?.response?.data?.detail || 'User wallet not found');
      return null;
    } finally {
      setActionLoading(false);
    }
  }, []);

  const settleOne = useCallback(async (transactionId) => {
    setActionLoading(true);
    try {
      await settleDeposit(transactionId, 'Admin manual settlement');
      await loadCore();
      if (lookup?.user?.user_id) {
        await lookupUser(lookup.user.user_id);
      }
      setError('');
    } catch (err) {
      setError(err?.response?.data?.detail || 'Settlement failed');
    } finally {
      setActionLoading(false);
    }
  }, [loadCore, lookup, lookupUser]);

  const settleAllEligible = useCallback(async () => {
    setActionLoading(true);
    try {
      await settleBatch(100);
      await loadCore();
      setError('');
    } catch (err) {
      setError(err?.response?.data?.detail || 'Batch settlement failed');
    } finally {
      setActionLoading(false);
    }
  }, [loadCore]);

  return {
    stats,
    pendingRows,
    txRows,
    lookup,
    loading,
    actionLoading,
    error,
    reload: loadCore,
    lookupUser,
    settleOne,
    settleAllEligible,
  };
}
