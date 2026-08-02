import React from 'react';
import { Link } from 'react-router-dom';
import { resolvePortalImageurl } from '../utils/portalImage';

const APP_TONES = ['mint', 'aurora', 'cobalt', 'solar', 'plasma'];

const STATUS_TONE = {
  pending: 'new',
  reviewing: 'reviewed',
  shortlisted: 'shortlisted',
  interview: 'interview',
  rejected: 'rejected',
};

export default function CompanyRecentApplicants({ rows }) {
  const list = rows || [];

  return (
    <section className="cp-section cp-glass cp-recent-apps">
      <div className="cp-section__head">
        <h2>Recent Applications</h2>
        <Link to="/company/dashboard/applications" className="cp-section__link">
          View all
        </Link>
      </div>
      <ul className="cp-apps-list">
        {list.length === 0 ? (
          <li className="cp-empty">No applications received yet.</li>
        ) : (
          list.map((row, index) => {
            const tone = APP_TONES[index % APP_TONES.length];
            const statusTone = STATUS_TONE[row.statusKey] || 'new';
            const appliedFor = row.appliedFor || row.position;
            return (
              <li key={row.id} className={`cp-apps-list__row cp-apps-list__row--${tone}`}>
                <img
                  className="cp-apps-list__avatar"
                  src={resolvePortalImageurl(row.imageurl, row.name)}
                  alt=""
                />
                <div className="cp-apps-list__main">
                  <strong>{row.name}</strong>
                  <span>{row.role || row.position}</span>
                  <em>Applied for: {appliedFor}</em>
                </div>
                <div className="cp-apps-list__side">
                  <em className="cp-apps-list__time">{row.time}</em>
                  <span className={`cp-apps-list__badge cp-apps-list__badge--${statusTone}`}>
                    {row.status}
                  </span>
                </div>
              </li>
            );
          })
        )}
      </ul>
    </section>
  );
}
