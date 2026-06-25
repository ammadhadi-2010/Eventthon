import React from 'react';
import { FiFilter } from 'react-icons/fi';
import { UPDATE_FILTERS } from './updateThemes';

const INACTIVE_FILTER_TONE = {
  all: 'text-slate-400',
  project: 'text-emerald-400',
  gig: 'text-purple-400',
  achievement: 'text-amber-400',
  squad: 'text-blue-400',
  job: 'text-pink-400',
  article: 'text-red-400',
};

function filterPillClass(filterKey, isActive) {
  const base = 'shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium';
  if (isActive) {
    return `${base} border-blue-500 bg-blue-600 text-white`;
  }
  return `${base} border-slate-800 bg-slate-900/60 ${INACTIVE_FILTER_TONE[filterKey] || 'text-slate-400'}`;
}

export default function UpdatesFilterRow({ activeFilter, onFilterChange }) {
  return (
    <div className="mt-2 w-full md:mt-3">
      <div className="flex w-full flex-row items-center gap-1.5 overflow-x-auto py-2 [-ms-overflow-style:none] [scrollbar-width:none] md:flex-wrap md:overflow-visible [&::-webkit-scrollbar]:hidden">
        {UPDATE_FILTERS.map((filter) => (
          <button
            key={filter.key}
            type="button"
            className={filterPillClass(filter.key, activeFilter === filter.key)}
            data-filter={filter.key}
            onClick={() => onFilterChange(filter.key)}
          >
            {filter.label}
          </button>
        ))}
        <button
          type="button"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200"
          aria-label="Filter updates"
        >
          <FiFilter size={14} />
        </button>
      </div>
    </div>
  );
}
