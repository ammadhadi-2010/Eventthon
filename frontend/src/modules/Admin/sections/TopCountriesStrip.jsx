import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ADMIN_COUNTRIES_ANALYTICS_PATH } from '../layout/adminWorkspacePaths';

export default function TopCountriesStrip({ items = [] }) {
  const navigate = useNavigate();

  if (!items.length) return null;

  return (
    <div className="admin-card-dark mt-5 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-black text-white">Top Countries</h3>
          <p className="text-xs text-slate-500">Network reach by registration geography.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate(ADMIN_COUNTRIES_ANALYTICS_PATH)}
          className="text-xs font-bold uppercase tracking-[0.16em] text-blue-400 hover:text-blue-300"
        >
          View All
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {items.map((item) => (
          <div
            key={item.country}
            className="min-w-[140px] flex-1 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2"
          >
            <div className="mb-2 flex items-center justify-between gap-2 text-xs">
              <span className="font-bold text-slate-200">{item.country}</span>
              <span className="font-bold text-slate-500">{item.share}</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.05]">
              <div
                className="h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
                style={{ width: item.share }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
