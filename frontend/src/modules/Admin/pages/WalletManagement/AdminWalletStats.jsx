import React from 'react';
import { Clock, Lock, Users, Wallet } from 'lucide-react';
import { formatThon } from '../../../../services/adminWalletService';

const CARDS = [
  { key: 'available_thon', label: 'Available Thon', icon: Wallet, tone: 'emerald' },
  { key: 'pending_thon', label: 'Pending Thon', icon: Clock, tone: 'amber' },
  { key: 'locked_thon', label: 'Locked Thon', icon: Lock, tone: 'rose' },
  { key: 'wallet_count', label: 'Active Wallets', icon: Users, tone: 'violet', isCount: true },
];

const toneClass = {
  emerald: 'from-emerald-500/20 to-emerald-600/5 text-emerald-400',
  amber: 'from-amber-500/20 to-amber-600/5 text-amber-400',
  rose: 'from-rose-500/20 to-rose-600/5 text-rose-400',
  violet: 'from-violet-500/20 to-violet-600/5 text-violet-400',
};

export default function AdminWalletStats({ stats, loading }) {
  return (
    <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {CARDS.map(({ key, label, icon: Icon, tone, isCount }) => (
        <article
          key={key}
          className={`admin-card-dark rounded-2xl border border-white/5 bg-gradient-to-br p-5 ${toneClass[tone]}`}
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{label}</span>
            <Icon size={16} className="opacity-80" />
          </div>
          <p className="text-2xl font-black text-white">
            {loading ? '…' : isCount ? (stats?.[key] ?? 0) : formatThon(stats?.[key] ?? 0)}
          </p>
        </article>
      ))}
      {!loading && stats ? (
        <p className="col-span-full text-xs text-slate-500">
          {stats.pending_deposits} pending deposit(s) · {stats.deposits_today} deposit(s) today
        </p>
      ) : null}
    </div>
  );
}
