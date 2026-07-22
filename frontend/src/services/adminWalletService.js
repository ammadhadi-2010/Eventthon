import API from '../api/axiosConfig';

function adminSessionHeaders() {
  const headers = {};
  const email = localStorage.getItem('userEmail');
  const mobile = localStorage.getItem('userMobile');
  if (email) headers['X-User-Email'] = email;
  if (mobile) headers['X-User-Mobile'] = mobile;
  return headers;
}

const adminOpts = (params) => ({
  params,
  headers: adminSessionHeaders(),
});

export async function fetchWalletStats() {
  const res = await API.get('/api/admin/wallet/stats', adminOpts());
  return res?.data?.data || null;
}

export async function fetchPendingDeposits(limit = 100) {
  const res = await API.get('/api/admin/wallet/pending', adminOpts({ limit }));
  return res?.data?.rows || [];
}

export async function fetchAdminWalletTransactions(params = {}) {
  const res = await API.get('/api/admin/wallet/transactions', adminOpts(params));
  return res?.data?.rows || [];
}

export async function fetchUserWalletAdmin(userId, txLimit = 30) {
  const res = await API.get(`/api/admin/wallet/users/${encodeURIComponent(userId)}`, adminOpts({ tx_limit: txLimit }));
  return res?.data?.data || null;
}

export async function settleDeposit(transactionId, adminNote = '') {
  const res = await API.post(
    '/api/admin/wallet/settle',
    { transaction_id: transactionId, admin_note: adminNote },
    { headers: adminSessionHeaders() },
  );
  return res?.data || null;
}

export async function settleBatch(limit = 100) {
  const res = await API.post(
    '/api/admin/wallet/settle-batch',
    null,
    adminOpts({ limit }),
  );
  return res?.data || null;
}

export async function fetchPendingWithdrawals(limit = 100) {
  const res = await API.get('/api/admin/wallet/withdrawals/pending', adminOpts({ limit }));
  return res?.data?.rows || [];
}

export async function approveWithdrawal(transactionId, adminNote = '') {
  const res = await API.post(
    '/api/admin/wallet/withdrawals/approve',
    { transaction_id: transactionId, admin_note: adminNote },
    { headers: adminSessionHeaders() },
  );
  return res?.data || null;
}

export async function rejectWithdrawal(transactionId, adminNote = '') {
  const res = await API.post(
    '/api/admin/wallet/withdrawals/reject',
    { transaction_id: transactionId, admin_note: adminNote },
    { headers: adminSessionHeaders() },
  );
  return res?.data || null;
}

export function formatThon(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '0 Thon';
  return `${n.toLocaleString(undefined, { maximumFractionDigits: 0 })} Thon`;
}

export function formatTxWhen(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}
