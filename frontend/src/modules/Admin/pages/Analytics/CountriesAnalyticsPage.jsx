import React from 'react';
import AdminViewerPageHeader from '../../sections/AdminViewerPageHeader';
import useCountriesAnalytics from './useCountriesAnalytics';

export default function CountriesAnalyticsPage() {
  const { rows, networkTotal, loading, error } = useCountriesAnalytics();

  return (
    <div className="admin-panel w-full p-5">
      <AdminViewerPageHeader
        title="Country Analytics"
        subtitle={`Comprehensive geographic breakdown — ${networkTotal.toLocaleString()} tracked users.`}
      />
      {error ? <p className="mb-4 text-sm text-rose-400">{error}</p> : null}
      <div className="admin-card-dark overflow-hidden">
        <table className="admin-table w-full text-left">
          <thead className="bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            <tr>
              <th className="p-5">Country</th>
              <th className="p-5">Users</th>
              <th className="p-5">Share</th>
              <th className="p-5">Distribution</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-sm text-slate-500">
                  Loading country analytics…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-sm text-slate-500">
                  No country data available.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.country} className="hover:bg-white/[0.02]">
                  <td className="p-4 text-sm font-semibold text-slate-200">{row.country}</td>
                  <td className="p-4 text-sm text-slate-300">{row.users.toLocaleString()}</td>
                  <td className="p-4 text-sm font-bold text-slate-400">{row.share}</td>
                  <td className="p-4">
                    <div className="h-2 max-w-xs rounded-full bg-white/[0.05]">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
                        style={{ width: row.share }}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
