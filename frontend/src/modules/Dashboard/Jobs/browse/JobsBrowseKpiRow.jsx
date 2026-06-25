import React, { useMemo } from 'react';
import { BusinessIcon } from '../../../../components/lottie';
import { useJobsHub } from '../context/JobsHubContext';
import { JOBS_BROWSE_STATS } from '../data/jobsBrowseData';
import { JOBS_KPI_LOTTIE } from './jobsBrowseKpiLottie';

const JobsBrowseKpiRow = () => {
  const { searchStats, boardStats } = useJobsHub();

  const stats = useMemo(() => {
    const live = Array.isArray(searchStats) && searchStats.length ? searchStats : boardStats;
    if (Array.isArray(live) && live.length) {
      return live.map((row) => ({
        label: row.label,
        value: row.value,
        change: row.change || row.delta || '',
        tone: row.tone || 'violet',
      }));
    }
    return JOBS_BROWSE_STATS;
  }, [searchStats, boardStats]);

  return (
    <div className="gigs-grid-4 gigs-stats-grid jobs-stats-grid jobs-mobile-swipe-lane">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`gigs-card gigs-stat-card gigs-tone-${stat.tone || 'violet'} jobs-mobile-swipe-lane__item`}
        >
          <div className="gigs-stat-head">
            <div>
              <h4 className="gigs-stat-value">{stat.value}</h4>
              <p className="gigs-stat-label">{stat.label}</p>
            </div>
            <div className="gigs-stat-badge gigs-stat-badge--lottie">
              <BusinessIcon
                src={JOBS_KPI_LOTTIE[stat.tone] || JOBS_KPI_LOTTIE.violet}
                size={32}
                label={`${stat.label} metric animation`}
              />
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

export default JobsBrowseKpiRow;
