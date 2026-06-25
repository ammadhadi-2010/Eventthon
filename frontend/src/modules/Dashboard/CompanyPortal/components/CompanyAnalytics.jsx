import React from 'react';
import AnalyticsSparkline from './AnalyticsSparkline';

const ROWS = [
  { key: 'profileViews', label: 'Profile Views' },
  { key: 'jobViews', label: 'Job Views' },
  { key: 'applications', label: 'Applications' },
  { key: 'hires', label: 'Hires' },
];

export default function CompanyAnalytics({ analytics }) {
  const a = analytics || {};
  const deltas = a.deltas || {};
  return (
    <section className="cp-section cp-glass cp-analytics">
      <div className="cp-section__head">
        <h2>Company Analytics</h2>
        <select className="cp-select" defaultValue="month" aria-label="Time range">
          <option value="month">This Month</option>
        </select>
      </div>
      <div className="cp-analytics-grid">
        {ROWS.map((row, i) => (
          <div key={row.key} className="cp-analytics-item">
            <p>{row.label}</p>
            <h3>{Number(a[row.key] ?? 0).toLocaleString()}</h3>
            <span className="cp-analytics-delta">{deltas[row.key] || '—'}</span>
            <AnalyticsSparkline tone={i} />
          </div>
        ))}
      </div>
    </section>
  );
}
