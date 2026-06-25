import React, { useEffect, useState } from 'react';
import { FiBriefcase } from 'react-icons/fi';
import { fetchGigHubMetrics } from '../services/gigsApi';

const FALLBACK_STATS = [
  { label: 'Active Gigs', value: '0', change: '0% this week', tone: 'violet' },
  { label: 'Freelancers', value: '0', change: '0% this week', tone: 'blue' },
  { label: 'Orders Completed', value: '0', change: '0% this week', tone: 'green' },
  { label: 'Total Earnings', value: '$0', change: '0% this week', tone: 'amber' },
];

/** Browse hub: stats strip below the hero — live API with safe fallback. */
const GigsBrowseStatsSection = () => {
  const [stats, setStats] = useState(FALLBACK_STATS);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const rows = await fetchGigHubMetrics();
        if (!alive || !rows.length) return;
        setStats(
          rows.map((row) => ({
            label: row.label,
            value: row.value,
            change: row.change,
            tone: row.tone,
          })),
        );
      } catch {
        /* keep fallback */
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="gigs-grid-4 gigs-stats-grid gigs-mobile-swipe-lane">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`gigs-card gigs-stat-card gigs-mobile-swipe-lane__item gigs-tone-${stat.tone}`}
        >
          <div className="gigs-stat-head">
            <div>
              <h4 className="gigs-stat-value">{stat.value}</h4>
              <p className="gigs-stat-label">{stat.label}</p>
            </div>
            <div className="gigs-stat-badge">
              <FiBriefcase size={13} />
            </div>
          </div>
          <p className="gigs-stat-change">{stat.change}</p>
          <svg className="gigs-stat-line" viewBox="0 0 100 28" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 22 L12 20 L20 16 L33 18 L44 12 L54 14 L67 9 L80 11 L90 6 L100 4" />
          </svg>
        </div>
      ))}
    </div>
  );
};

export default GigsBrowseStatsSection;
