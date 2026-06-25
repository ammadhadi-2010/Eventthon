import React, { useMemo, useState } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import RecentProjectsTable from './RecentProjectsTable';
import { PROJECT_STATUS_FILTERS } from './projectData';
import './projectManagement.css';

export default function AllProjectsView({
  rows = [],
  loading = false,
  onBack,
  onViewProject,
  onEditProject,
  onChangeStatus,
  onArchiveProject,
}) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((p) => {
      const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
      const matchesQuery =
        !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [query, rows, statusFilter]);

  return (
    <div className="pm-page pm-all-page block w-full min-w-0 flex-1 overflow-y-auto text-white">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/[0.06]"
      >
        <ArrowLeft size={14} /> Back to Dashboard
      </button>

      <header className="mb-4 min-w-0 sm:mb-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 sm:text-[11px]">
          Dashboard &gt; Project Management &gt; All Projects
        </p>
        <h1 className="mt-1 text-[22px] font-black text-white sm:text-[26px]">All Projects</h1>
        <p className="mt-1 text-xs text-slate-400 sm:text-sm">
          {filteredRows.length} of {rows.length} projects in portfolio
        </p>
      </header>

      <div className="mb-4 flex w-full min-w-0 flex-col gap-3">
        <div className="admin-chip flex w-full min-w-0 items-center gap-2 px-3 py-2.5 text-slate-400 sm:px-4">
          <Search size={15} className="shrink-0" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects..."
            className="w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          />
        </div>

        <div className="pm-all-filters flex w-full min-w-0 gap-2 overflow-x-auto pb-1 scrollbar-none">
          {PROJECT_STATUS_FILTERS.map((status) => {
            const active = statusFilter === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-[11px] font-bold transition ${
                  active
                    ? 'bg-violet-600 text-white'
                    : 'border border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                {status}
              </button>
            );
          })}
        </div>
      </div>

      <RecentProjectsTable
        rows={filteredRows}
        loading={loading}
        title="All Projects"
        showViewAllLink={false}
        onViewProject={onViewProject}
        onEditProject={onEditProject}
        onChangeStatus={onChangeStatus}
        onArchiveProject={onArchiveProject}
      />
    </div>
  );
}
