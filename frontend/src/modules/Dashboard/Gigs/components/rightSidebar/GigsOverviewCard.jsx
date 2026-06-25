import React from 'react';
import { FiChevronDown } from 'react-icons/fi';

export default function GigsOverviewCard({ metrics, formattedEarnings, onTogglePeriod, onGoToMyGigs }) {
  return (
    <div className="gigs-card gigs-right-overview-card">
      <div className="gigs-right-headline">
        <h3>Your Gig Overview</h3>
        <button type="button" onClick={onTogglePeriod} aria-label="Change overview period">
          {metrics.label} <FiChevronDown size={12} />
        </button>
      </div>
      <div className="gigs-right-overview-main">
        <p>Earnings</p>
        <h4>{formattedEarnings}</h4>
        <span>{metrics.earningsDelta}</span>
      </div>
      <svg className="gigs-right-overview-line" viewBox="0 0 100 28" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 24 L10 23 L18 18 L28 16 L38 19 L47 14 L57 11 L68 17 L78 10 L88 6 L100 8" />
      </svg>
      <div className="gigs-right-mini-grid">
        <div>
          <p>Orders</p>
          <strong>{metrics.orders}</strong>
          <small>{metrics.ordersDelta}</small>
        </div>
        <div>
          <p>Views</p>
          <strong>{metrics.views}</strong>
          <small>{metrics.viewsDelta}</small>
        </div>
        <div>
          <p>Success Rate</p>
          <strong>{metrics.successRate}%</strong>
          <small>{metrics.successDelta}</small>
        </div>
      </div>
      <button type="button" className="gigs-right-primary-btn" onClick={onGoToMyGigs}>
        Go To My Gigs
      </button>
    </div>
  );
}
