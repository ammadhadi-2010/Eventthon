import React from 'react';
import AnalyticsSparkline from './AnalyticsSparkline';

const ROWS = [
  { key: 'profileViews', label: 'Profile Views', tone: 'plasma' },
  { key: 'jobViews', label: 'Job Views', tone: 'cobalt' },
  { key: 'applications', label: 'Applications', tone: 'mint' },
  { key: 'hires', label: 'Hires', tone: 'solar' },
  { key: 'followersGrowth', label: 'Followers', tone: 'coral' },
];

export default function CompanyAnalytics({ analytics }) {
  const a = analytics || {};
  const deltas = a.deltas || {};
  const series = a.series || {};

  return (
    <section className="cp-section cp-glass cp-analytics">
      <div className="cp-section__head">
        <h2>Company Analytics</h2>
        <span className="cp-analytics-range">Last 7 days</span>
      </div>
      <div className="cp-analytics-grid cp-analytics-grid--five">
        {ROWS.map((row, i) => (
          <article key={row.key} className={`cp-analytics-item cp-analytics-item--${row.tone}`}>
            <p>{row.label}</p>
            <h3>{Number(a[row.key] ?? 0).toLocaleString()}</h3>
            <span className="cp-analytics-delta">{deltas[row.key] || '—'}</span>
            <AnalyticsSparkline series={series[row.key]} tone={i} shade={row.tone} />
          </article>
        ))}
      </div>
    </section>
  );
}
