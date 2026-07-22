import React, { useState } from 'react';
import { CheckCircle2, RefreshCw, Search } from 'lucide-react';
import AdminViewerPageHeader from '../../sections/AdminViewerPageHeader';
import AdminWalletStats from './AdminWalletStats';
import useAdminWallet from './useAdminWallet';
import { formatThon, formatTxWhen } from '../../../../services/adminWalletService';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'pending', label: 'Pending Settlements' },
  { id: 'lookup', label: 'User Lookup' },
  { id: 'transactions', label: 'All Transactions' },
];

function StatusBadge({ status }) {
  const done = String(status).toLowerCase() === 'completed';
  return (
    <span
      className={`rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em] ${
        done ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
      }`}
    >
      {status}
    </span>
  );
}

function TxTable({ rows, loading, showActions, onSettle, actionLoading }) {
  return (
    <div className="admin-card-dark admin-scroll overflow-x-auto">
      <table className="admin-table w-full text-left">
        <thead className="bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
          <tr>
            <th className="p-5">Transaction</th>
            <th className="p-5">User</th>
            <th className="p-5">Type</th>
            <th className="p-5">Amount</th>
            <th className="p-5">Gateway</th>
            <th className="p-5">Status</th>
            <th className="p-5">Date</th>
            {showActions ? <th className="p-5">Action</th> : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {loading ? (
            <tr><td colSpan={showActions ? 8 : 7} className="p-8 text-center text-sm text-slate-500">Loading…</td></tr>
          ) : rows.length === 0 ? (
            <tr><td colSpan={showActions ? 8 : 7} className="p-8 text-center text-sm text-slate-500">No records found.</td></tr>
          ) : rows.map((row) => (
            <tr key={row.transaction_id} className="hover:bg-white/[0.02]">
              <td className="p-4 text-xs font-bold text-slate-500">{row.transaction_id}</td>
              <td className="p-4 text-sm font-semibold text-slate-200">{row.user}</td>
              <td className="p-4 text-sm text-slate-300">{row.type}</td>
              <td className="p-4 text-sm font-semibold text-slate-200">{row.amount_label || formatThon(row.thon_amount)}</td>
              <td className="p-4 text-xs text-slate-500">{row.gateway || '—'}</td>
              <td className="p-4"><StatusBadge status={row.status} /></td>
              <td className="p-4 text-xs text-slate-500">{formatTxWhen(row.created_at)}</td>
              {showActions ? (
                <td className="p-4">
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => onSettle(row.transaction_id)}
                    className="rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/25 disabled:opacity-50"
                  >
                    Settle
                  </button>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminWalletPage() {
  const [tab, setTab] = useState('overview');
  const [search, setSearch] = useState('');
  const {
    stats, pendingRows, txRows, lookup, loading, actionLoading, error,
    reload, lookupUser, settleOne, settleAllEligible,
  } = useAdminWallet();

  const handleLookup = (e) => {
    e.preventDefault();
    lookupUser(search);
    setTab('lookup');
  };

  return (
    <div className="admin-panel w-full p-5">
      <AdminViewerPageHeader
        title="Wallet & Finance"
        subtitle="Platform Thon balances, pending settlements, and user wallet oversight."
        actions={(
          <button
            type="button"
            onClick={reload}
            disabled={loading || actionLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-white/5"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        )}
      />

      {error ? <p className="mb-4 text-sm text-rose-400">{error}</p> : null}
      <AdminWalletStats stats={stats} loading={loading} />

      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-xl px-4 py-2 text-xs font-black uppercase tracking-[0.15em] ${
              tab === item.id ? 'bg-violet-500/20 text-violet-300' : 'bg-white/5 text-slate-500 hover:text-slate-300'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'overview' ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-slate-200">Recent Activity</h3>
            <button
              type="button"
              disabled={actionLoading || pendingRows.length === 0}
              onClick={settleAllEligible}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/15 px-4 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/25 disabled:opacity-50"
            >
              <CheckCircle2 size={14} /> Release eligible pending (batch)
            </button>
          </div>
          <TxTable rows={txRows.slice(0, 20)} loading={loading} />
        </section>
      ) : null}

      {tab === 'pending' ? (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200">{pendingRows.length} pending deposit(s)</h3>
            <button
              type="button"
              disabled={actionLoading || pendingRows.length === 0}
              onClick={settleAllEligible}
              className="text-xs font-bold text-emerald-400 hover:underline disabled:opacity-50"
            >
              Settle all eligible
            </button>
          </div>
          <TxTable
            rows={pendingRows}
            loading={loading}
            showActions
            onSettle={settleOne}
            actionLoading={actionLoading}
          />
        </section>
      ) : null}

      {tab === 'lookup' ? (
        <section className="space-y-4">
          <form onSubmit={handleLookup} className="admin-card-dark flex flex-wrap gap-3 p-4">
            <label className="flex min-w-[240px] flex-1 flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">User ID / Email / Mobile</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search user wallet"
                className="rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500/50"
              />
            </label>
            <button
              type="submit"
              disabled={actionLoading}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-500/20 px-5 py-2.5 text-xs font-bold text-violet-300"
            >
              <Search size={14} /> Lookup
            </button>
          </form>
          {lookup ? (
            <div className="admin-card-dark grid gap-4 p-5 md:grid-cols-2">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">User</p>
                <p className="text-lg font-bold text-white">{lookup.user?.name}</p>
                <p className="text-xs text-slate-500">{lookup.user?.email || lookup.user?.mobile}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-slate-500">Available</span><p className="font-bold text-emerald-400">{formatThon(lookup.wallet?.available_thon)}</p></div>
                <div><span className="text-slate-500">Pending</span><p className="font-bold text-amber-400">{formatThon(lookup.wallet?.pending_thon)}</p></div>
                <div><span className="text-slate-500">Locked</span><p className="font-bold text-rose-400">{formatThon(lookup.wallet?.locked_thon)}</p></div>
                <div><span className="text-slate-500">Withdrawable</span><p className="font-bold text-white">{formatThon(lookup.wallet?.withdrawable_balance)}</p></div>
              </div>
              <div className="md:col-span-2">
                <TxTable rows={lookup.transactions || []} loading={false} />
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {tab === 'transactions' ? (
        <TxTable rows={txRows} loading={loading} />
      ) : null}
    </div>
  );
}
