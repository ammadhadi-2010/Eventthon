import React from 'react';
import { Bell } from 'lucide-react';
import EventThonLogo from '../../../components/brand/EventThonLogo';
import { topbarIcons } from '../data/adminConfig';

const { search: Search, settings: Settings } = topbarIcons;

export default function AdminTopbar() {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-4">
        <EventThonLogo variant="header" className="shrink-0" />
        <div className="admin-chip flex min-w-[360px] items-center gap-3 px-4 py-3 text-slate-400">
          <Search size={16} />
          <span className="text-sm">Search anything...</span>
          <span className="rounded-lg bg-white/5 px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
            ⌘ K
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="admin-chip admin-action-btn px-4 py-3 text-sm font-semibold text-slate-300">
          Quick Actions
        </button>
        <div className="admin-chip px-4 py-3 text-[11px] font-bold text-slate-400">
          Mar 19 - May 25, 2025
        </div>
        <button className="admin-chip admin-action-btn relative p-3 text-slate-400">
          <Bell size={16} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
        </button>
        <button className="admin-chip admin-action-btn p-3 text-slate-400">
          <Settings size={16} />
        </button>
        <div className="admin-chip flex items-center gap-3 px-3 py-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 font-black text-black">
            A
          </div>
          <div>
            <p className="text-sm font-bold text-white">Admin</p>
            <p className="text-[11px] text-slate-400">Super Administrator</p>
          </div>
        </div>
      </div>
    </div>
  );
}
