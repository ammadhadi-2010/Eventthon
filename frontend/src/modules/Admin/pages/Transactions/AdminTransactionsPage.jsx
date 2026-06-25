import React from 'react';
import AdminViewerPageHeader from '../../sections/AdminViewerPageHeader';
import useAdminTransactions from './useAdminTransactions';

export default function AdminTransactionsPage() {
  const { rows, loading, error } = useAdminTransactions();

  return (
    <div className="admin-panel w-full p-5">
      <AdminViewerPageHeader
        title="Recent Transactions"
        subtitle="Full ledger of platform payments and finance activity."
      />
      {error ? <p className="mb-4 text-sm text-rose-400">{error}</p> : null}
      <div className="admin-card-dark admin-scroll overflow-x-auto">
        <table className="admin-table w-full text-left">
          <thead className="bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            <tr>
              <th className="p-5">ID</th>
              <th className="p-5">User</th>
              <th className="p-5">Type</th>
              <th className="p-5">Amount</th>
              <th className="p-5">Status</th>
              <th className="p-5">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-sm text-slate-500">
                  Loading transactions…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-sm text-slate-500">
                  No transactions found.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="hover:bg-white/[0.02]">
                  <td className="p-4 text-xs font-bold text-slate-500">{row.id}</td>
                  <td className="p-4 text-sm font-semibold text-slate-200">{row.user}</td>
                  <td className="p-4 text-sm text-slate-300">{row.type}</td>
                  <td className="p-4 text-sm font-semibold text-slate-200">{row.amount}</td>
                  <td className="p-4">
                    <span
                      className={`rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em] ${
                        row.status === 'Completed'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-amber-500/10 text-amber-400'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-slate-500">{row.date}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
