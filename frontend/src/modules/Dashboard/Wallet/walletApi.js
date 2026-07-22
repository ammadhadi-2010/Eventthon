import API from '../../../api/axiosConfig';

const walletBase = '/finance';

const resolveUserId = (userData) => {
  const stored = String(localStorage.getItem('userId') || '').trim();
  if (stored) return stored;
  return String(userData?._id || userData?.id || userData?.user_id || '').trim();
};

export { resolveUserId };

function walletSessionHeaders() {
  const headers = {};
  const email = localStorage.getItem('userEmail');
  const mobile = localStorage.getItem('userMobile');
  if (email) headers['X-User-Email'] = email;
  if (mobile) headers['X-User-Mobile'] = mobile;
  return headers;
}

const authedConfig = (params) => ({
  params,
  headers: walletSessionHeaders(),
});

export const getWalletSummary = async (userData) => {
  const userId = resolveUserId(userData);
  if (!userId) return null;
  const res = await API.get(`${walletBase}/wallet/${userId}`, authedConfig());
  return res?.data?.data || null;
};

export const getWalletTransactions = async (userData, limit = 50, filters = {}) => {
  const userId = resolveUserId(userData);
  if (!userId) return [];
  const res = await API.get(`${walletBase}/wallet/${userId}/transactions`, authedConfig({ limit, ...filters }));
  return res?.data?.data || [];
};

export const getBankAccounts = async (userData) => {
  const userId = resolveUserId(userData);
  if (!userId) return [];
  const res = await API.get(`${walletBase}/wallet/${userId}/bank-accounts`, authedConfig());
  return res?.data?.data || [];
};

export const addBankAccount = async (userData, accountData) => {
  const userId = resolveUserId(userData);
  if (!userId) return null;
  const res = await API.post(`${walletBase}/save_bank_account/${userId}`, accountData, {
    headers: walletSessionHeaders(),
  });
  return res?.data?.data || null;
};

export const deleteBankAccount = async (userData, accountId) => {
  const userId = resolveUserId(userData);
  if (!userId) return null;
  const res = await API.delete(`${walletBase}/wallet/${userId}/bank-accounts/${accountId}`, authedConfig());
  return res?.data || null;
};

export const transferAssets = async ({ fromUserId, toUserId, amount, currency = 'THON', note = '' }) => {
  const res = await API.post(
    `${walletBase}/wallet/transfer`,
    { from_user_id: fromUserId, to_user_id: toUserId, amount, currency, note },
    { headers: walletSessionHeaders() },
  );
  return res?.data || null;
};

export const requestWithdraw = async (userData, payload) => {
  const userId = resolveUserId(userData);
  if (!userId) return null;
  const res = await API.post(`${walletBase}/wallet/${userId}/withdraw`, payload, {
    headers: walletSessionHeaders(),
  });
  return res?.data || null;
};

export const getWalletSecurity = async (userData) => {
  const userId = resolveUserId(userData);
  if (!userId) return null;
  const res = await API.get(`${walletBase}/wallet/${userId}/security`, authedConfig());
  return res?.data?.data || null;
};

export const updateWalletSecurity = async (userData, payload) => {
  const userId = resolveUserId(userData);
  if (!userId) return null;
  const res = await API.put(`${walletBase}/wallet/${userId}/security`, payload, {
    headers: walletSessionHeaders(),
  });
  return res?.data?.data || null;
};

export const getWalletPreferences = async (userData) => {
  const userId = resolveUserId(userData);
  if (!userId) return null;
  const res = await API.get(`${walletBase}/wallet/${userId}/preferences`, authedConfig());
  return res?.data?.data || null;
};

export const updateWalletPreferences = async (userData, payload) => {
  const userId = resolveUserId(userData);
  if (!userId) return null;
  const res = await API.put(`${walletBase}/wallet/${userId}/preferences`, payload, {
    headers: walletSessionHeaders(),
  });
  return res?.data?.data || null;
};

export const getPaymentConfig = async () => {
  const res = await API.get(`${walletBase}/payments/config`);
  return res?.data?.data || null;
};

export const createDepositCheckout = async (userData, { amountUsd, successUrl, cancelUrl, gateway }) => {
  const userId = resolveUserId(userData);
  if (!userId) throw new Error('User not signed in');
  const payload = {
    user_id: userId,
    amount_usd: Number(amountUsd),
    success_url: successUrl,
    cancel_url: cancelUrl,
  };
  if (gateway) payload.gateway = gateway;
  const res = await API.post(`${walletBase}/payments/checkout/deposit`, payload, {
    headers: walletSessionHeaders(),
  });
  return res?.data || null;
};
