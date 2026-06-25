import React from 'react';

export default function DonutSummaryChart({ centerValue, centerLabel }) {
  return (
    <div className="flex items-center justify-center">
      <div className="admin-donut relative flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-black">{centerValue}</div>
          <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{centerLabel}</div>
        </div>
      </div>
    </div>
  );
}
