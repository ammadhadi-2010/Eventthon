import API from '../../../api/axiosConfig';

const walletBase = '/finance';

const resolveUserId = (userData) =>
  userData?._id || userData?.id || userData?.user_id || '';

export const getWalletSummary = async (userData) => {
  const userId = resolveUserId(userData);
  if (!userId) return null;
  const res = await API.get(`${walletBase}/wallet/${userId}`);
  return res?.data?.data || null;
};

export const getWalletTransactions = async (userData, limit = 50) => {
  const userId = resolveUserId(userData);
  if (!userId) return [];
  const res = await API.get(`${walletBase}/wallet/${userId}/transactions`, {
    params: { limit },
  });
  return res?.data?.data || [];
};

export const getBankAccounts = async (userData) => {
  const userId = resolveUserId(userData);
  if (!userId) return [];
  const res = await API.get(`${walletBase}/wallet/${userId}/bank-accounts`);
  return res?.data?.data || [];
};

export const addBankAccount = async (userData, accountData) => {
  const userId = resolveUserId(userData);
  if (!userId) return null;
  const res = await API.post(`${walletBase}/save_bank_account/${userId}`, accountData);
  return res?.data?.data || null;
};

export const transferAssets = async ({ fromUserId, toUserId, amount, currency = 'THON', note = '' }) => {
  const res = await API.post(`${walletBase}/wallet/transfer`, {
    from_user_id: fromUserId,
    to_user_id: toUserId,
    amount,
    currency,
    note,
  });
  return res?.data || null;
};

export const requestWithdraw = async (userData, payload) => {
  const userId = resolveUserId(userData);
  if (!userId) return null;
  const res = await API.post(`${walletBase}/wallet/${userId}/withdraw`, payload);
  return res?.data || null;
};

export const getWalletSecurity = async (userData) => {
  const userId = resolveUserId(userData);
  if (!userId) return null;
  const res = await API.get(`${walletBase}/wallet/${userId}/security`);
  return res?.data?.data || null;
};

export const updateWalletSecurity = async (userData, payload) => {
  const userId = resolveUserId(userData);
  if (!userId) return null;
  const res = await API.put(`${walletBase}/wallet/${userId}/security`, payload);
  return res?.data?.data || null;
};

export const getWalletPreferences = async (userData) => {
  const userId = resolveUserId(userData);
  if (!userId) return null;
  const res = await API.get(`${walletBase}/wallet/${userId}/preferences`);
  return res?.data?.data || null;
};

export const updateWalletPreferences = async (userData, payload) => {
  const userId = resolveUserId(userData);
  if (!userId) return null;
  const res = await API.put(`${walletBase}/wallet/${userId}/preferences`, payload);
  return res?.data?.data || null;
};
