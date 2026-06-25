import React from 'react';
import { CalendarDays, ChevronDown, Filter, Plus } from 'lucide-react';

const QUICK_ACTIONS = ['Export Report', 'Bulk Archive', 'Assign Manager'];

export default function ProjectManagementHeader({
  rangeLabel,
  quickOpen,
  onQuickToggle,
  onNewProject,
}) {
  return (
    <header className="pm-header mb-5 w-full min-w-0">
      <div className="mb-3 min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
          Dashboard &gt; Project Management
        </p>
        <h1 className="mt-1 text-[22px] font-black text-white sm:text-[26px]">Project Management</h1>
        <p className="pm-subtitle--compact mt-1 text-sm text-slate-400">
          Monitor portfolio health, status mix, and recent delivery activity.
        </p>
      </div>

      <div className="pm-header-actions flex w-full min-w-0 flex-nowrap items-center gap-2 overflow-x-auto scrollbar-none">
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={onQuickToggle}
            className="admin-chip inline-flex items-center gap-2 whitespace-nowrap px-3 py-2 text-xs font-bold text-slate-300"
          >
            Quick Actions
            <ChevronDown size={14} />
          </button>
          {quickOpen ? (
            <div className="absolute left-0 z-20 mt-2 min-w-[160px] rounded-xl border border-[#1f2228] bg-[#121418] p-1 shadow-xl">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action}
                  type="button"
                  className="block w-full rounded-lg px-3 py-2 text-left text-xs text-slate-300 hover:bg-white/5"
                >
                  {action}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <button
          type="button"
          className="admin-chip inline-flex shrink-0 items-center gap-2 whitespace-nowrap px-3 py-2 text-xs font-bold text-slate-300"
        >
          <CalendarDays size={14} />
          <span className="max-[380px]:hidden">{rangeLabel}</span>
          <span className="hidden max-[380px]:inline">7 mo</span>
        </button>

        <button
          type="button"
          onClick={onNewProject}
          className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-blue-600 px-3 py-2 text-[11px] font-bold uppercase text-white shadow-lg shadow-blue-900/30 hover:bg-blue-500 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-xs"
        >
          <Plus size={14} />
          <span className="sm:hidden">New</span>
          <span className="hidden sm:inline">New Project</span>
        </button>

        <button
          type="button"
          className="pm-filter-btn admin-chip inline-flex shrink-0 items-center gap-2 whitespace-nowrap px-3 py-2 text-xs font-bold text-slate-300"
        >
          <Filter size={14} />
          Filters
        </button>
      </div>
    </header>
  );
}
