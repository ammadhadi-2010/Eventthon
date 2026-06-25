import React from 'react';
import { useNavigate } from 'react-router-dom';

const STATUS_CLASS = {
  applied: 'jh-app-status--applied',
  inreview: 'jh-app-status--review',
  interview: 'jh-app-status--interview',
  assessment: 'jh-app-status--assessment',
};

export default function JobsSidebarActivity({ activity, loading }) {
  const navigate = useNavigate();

  return (
    <div className="gigs-card gigs-side-card">
      <div className="gigs-side-head">
        <h3>Application Activity</h3>
        <button type="button" onClick={() => navigate('/jobs/applications')}>
          View All
        </button>
      </div>
      <div className="gigs-activity-list">
        {loading ? (
          <p className="jh-side-empty">Loading activity…</p>
        ) : activity.length === 0 ? (
          <p className="jh-side-empty">No applications yet. Apply from the job board.</p>
        ) : (
          activity.map((item) => (
            <div key={item.id || `${item.company}-${item.role}`} className="gigs-activity-row">
              <div className={`gigs-activity-logo ${item.logoClass || 'google'}`}>{item.logo}</div>
              <div>
                <p className="gigs-activity-company">{item.company}</p>
                <p className="gigs-activity-role">{item.role}</p>
              </div>
              <div className="gigs-activity-meta">
                <p className={STATUS_CLASS[item.statusKey] || 'jh-app-status--applied'}>{item.status}</p>
                <span>{item.time}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
