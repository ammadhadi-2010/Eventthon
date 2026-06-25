import React from 'react';

export default function TopCountriesCard({ items }) {
  return (
    <div className="admin-card-dark p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-black">Top Countries</h3>
        <button className="text-xs font-bold uppercase tracking-[0.16em] text-blue-400">View All</button>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.country} className="admin-activity-row px-3 py-3">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-200">{item.country}</span>
              <span className="text-xs font-bold text-slate-500">{item.share}</span>
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
