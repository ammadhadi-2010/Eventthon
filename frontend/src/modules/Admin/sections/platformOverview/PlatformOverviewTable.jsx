import React, { memo, useMemo } from 'react';
import PlatformOverviewTableSkeleton from '../../components/skeleton/PlatformOverviewTableSkeleton';

function PlatformOverviewTable({ tab, loading }) {
  const columns = useMemo(() => tab?.tableColumns || [], [tab]);
  const rows = useMemo(() => tab?.tableRows || [], [tab]);

  if (loading && !tab) {
    return <PlatformOverviewTableSkeleton />;
  }

  return (
    <div className="admin-card-dark mt-4 overflow-hidden p-0">
      <div className="border-b border-white/5 px-5 py-4">
        <h4 className="text-sm font-black text-white">Summary Grid</h4>
        <p className="mt-1 text-xs text-slate-500">Latest records for quick scanning.</p>
      </div>
      <div className="admin-scroll overflow-x-auto">
        <table className="admin-table w-full text-left text-sm">
          <thead>
            <tr className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
              {columns.map((col) => (
                <th key={col.key} className="px-5 py-3 font-bold">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length || 1} className="px-5 py-8 text-center text-slate-500">
                  No records found for this metric.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={`${row.name}-${index}`} className="border-t border-white/5">
                  {columns.map((col) => (
                    <td key={col.key} className="px-5 py-3 text-slate-300">
                      {row[col.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default memo(PlatformOverviewTable);
