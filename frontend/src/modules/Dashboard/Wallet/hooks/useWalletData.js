import { useCallback, useEffect, useState } from 'react';
import {
  addBankAccount,
  getBankAccounts,
  getWalletPreferences,
  getWalletSecurity,
  getWalletSummary,
  getWalletTransactions,
  requestWithdraw,
  transferAssets,
  updateWalletPreferences,
  updateWalletSecurity,
} from '../walletApi';

export default function useWalletData(userData) {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [security, setSecurity] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!userData?._id && !userData?.id && !userData?.user_id) return;
    setLoading(true);
    try {
      const [walletData, txRows, bankRows, securityData, preferenceData] = await Promise.all([
        getWalletSummary(userData),
        getWalletTransactions(userData),
        getBankAccounts(userData),
        getWalletSecurity(userData),
        getWalletPreferences(userData),
      ]);
      setWallet(walletData);
      setTransactions(txRows);
      setBankAccounts(bankRows);
      setSecurity(securityData);
      setPreferences(preferenceData);
    } catch (err) {
      console.error('Wallet data load failed:', err);
    } finally {
      setLoading(false);
    }
  }, [userData]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addBank = useCallback(
    async (accountData) => {
      const created = await addBankAccount(userData, accountData);
      if (created) {
        setBankAccounts((prev) => [created, ...prev]);
      }
      return created;
    },
    [userData],
  );

  const transfer = useCallback(
    async ({ toUserId, amount, currency = 'THON', note = '' }) => {
      const fromUserId = userData?._id || userData?.id || userData?.user_id;
      if (!fromUserId || !toUserId) return { status: 'error', message: 'Invalid users' };
      try {
        const result = await transferAssets({
          fromUserId,
          toUserId,
          amount,
          currency,
          note,
        });
        await refresh();
        return result || { status: 'success' };
      } catch (err) {
        console.error('Wallet transfer failed:', err);
        return { status: 'error', message: err?.response?.data?.detail || 'Transfer failed' };
      }
    },
    [refresh, userData],
  );

  const withdraw = useCallback(
    async ({ amount, currency = 'THON', note = '' }) => {
      try {
        const result = await requestWithdraw(userData, { amount, currency, note });
        await refresh();
        return result || { status: 'success' };
      } catch (err) {
        console.error('Wallet withdraw failed:', err);
        return { status: 'error', message: err?.response?.data?.detail || 'Withdraw failed' };
      }
    },
    [refresh, userData],
  );

  const saveSecurity = useCallback(
    async (payload) => {
      try {
        const data = await updateWalletSecurity(userData, payload);
        if (data) setSecurity(data);
        return { status: 'success', data };
      } catch (err) {
        console.error('Save wallet security failed:', err);
        return { status: 'error', message: err?.response?.data?.detail || 'Unable to save security settings' };
      }
    },
    [userData],
  );

  const savePreferences = useCallback(
    async (payload) => {
      try {
        const data = await updateWalletPreferences(userData, payload);
        if (data) setPreferences(data);
        return { status: 'success', data };
      } catch (err) {
        console.error('Save wallet preferences failed:', err);
        return { status: 'error', message: err?.response?.data?.detail || 'Unable to save preferences' };
      }
    },
    [userData],
  );

  return {
    wallet,
    transactions,
    bankAccounts,
    security,
    preferences,
    loading,
    refresh,
    addBank,
    transfer,
    withdraw,
    saveSecurity,
    savePreferences,
  };
}
