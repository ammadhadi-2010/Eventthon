import React from 'react';

/** Compact analytics grid for My Gigs / Orders right rail. */
export default function GigsRightAnalyticsCard({ title, subtitle, metrics = [], loading = false }) {
  return (
    <div className="gigs-card gigs-right-analytics-card">
      <div className="gigs-right-analytics-head">
        <h3>{title}</h3>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {loading ? <p className="gigs-right-analytics-status">Refreshing metrics…</p> : null}
      <div className="gigs-right-analytics-grid">
        {metrics.map((item) => (
          <article key={item.label} className="gigs-right-analytics-tile">
            <span className="gigs-right-analytics-tile__label">{item.label}</span>
            <strong className="gigs-right-analytics-tile__value">{item.value}</strong>
            {item.hint ? <small className="gigs-right-analytics-tile__hint">{item.hint}</small> : null}
          </article>
        ))}
      </div>
    </div>
  );
}
