import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { ADMIN_TRANSACTIONS_PATH } from '../layout/adminWorkspacePaths';

export default function ReviewQueue({ users, viewMode, loading, onSelectUser, rows = [] }) {
  const navigate = useNavigate();

  return (
    <div className="admin-card-dark p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black">Recent Transactions</h3>
          <p className="text-sm text-slate-500">
            Live payment and platform finance activity snapshot.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate(ADMIN_TRANSACTIONS_PATH)}
          className="admin-action-btn rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-blue-400"
        >
          View All
        </button>
      </div>

      <div className="admin-card-dark admin-scroll">
        <table className="admin-table text-left">
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
            {rows.map((row, index) => (
              <tr key={row.id} className="transition-all hover:bg-white/[0.02]">
                <td className="p-4 text-xs font-bold text-slate-500">{row.id}</td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.08] text-xs font-black text-white">
                      {row.user.charAt(0)}
                    </div>
                    <div className="text-sm font-semibold text-slate-200">{row.user}</div>
                  </div>
                </td>
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
                <td className="p-4 text-xs text-slate-500">
                  <div className="flex items-center justify-between gap-3">
                    <span>{row.date}</span>
                    <button
                      type="button"
                      onClick={() => onSelectUser(users[index] || users[0])}
                      className="rounded-xl bg-blue-600/10 p-2 text-blue-400 transition-all hover:bg-blue-600 hover:text-white"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-sm text-slate-500">
                  No transactions found in this view.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
