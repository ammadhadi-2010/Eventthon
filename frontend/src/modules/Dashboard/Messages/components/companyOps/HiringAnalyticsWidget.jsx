import React, { useEffect, useState } from 'react';
import { fetchCompanyHiringAnalytics } from '../../services/companyHiringApi';

const METRICS = [
  { key: 'responseTime', label: 'Response' },
  { key: 'averageReplyTime', label: 'Avg reply' },
  { key: 'messagesCount', label: 'Messages' },
  { key: 'filesShared', label: 'Files' },
  { key: 'interviewCount', label: 'Interviews' },
  { key: 'offerRate', label: 'Offer', suffix: '%' },
  { key: 'hiringRate', label: 'Hire', suffix: '%' },
];

/** Compact analytics strip for the right workspace column. */
export default function HiringAnalyticsWidget({ compact = false }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    let alive = true;
    fetchCompanyHiringAnalytics()
      .then((row) => {
        if (alive) setData(row);
      })
      .catch(() => {
        if (alive) setData(null);
      });
    return () => {
      alive = false;
    };
  }, []);

  if (!data) return null;

  return (
    <section className={`chs-card cops-analytics${compact ? ' cops-analytics--compact' : ''}`}>
      <h5>Analytics</h5>
      <div className="cops-analytics__grid">
        {METRICS.map((m) => (
          <div key={m.key}>
            <small>{m.label}</small>
            <strong>
              {data[m.key] ?? '—'}
              {m.suffix && data[m.key] != null && data[m.key] !== '—' ? m.suffix : ''}
            </strong>
          </div>
        ))}
      </div>
    </section>
  );
}
