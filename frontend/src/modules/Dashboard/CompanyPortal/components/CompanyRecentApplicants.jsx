import React from 'react';
import { Link } from 'react-router-dom';
import { resolvePortalImageurl } from '../utils/portalImage';
import { STATUS_CLASS } from '../companyPortalMenu';

export default function CompanyRecentApplicants({ rows }) {
  const list = rows || [];
  return (
    <section className="cp-section cp-glass">
      <div className="cp-section__head">
        <h2>Recent Applications</h2>
        <Link to="/company/dashboard/applications" className="cp-link-arrow">
          View All Applications →
        </Link>
      </div>
      <ul className="cp-applicant-list">
        {list.length === 0 ? (
          <li className="cp-empty">No applications received yet.</li>
        ) : (
          list.map((row) => (
            <li key={row.id} className="cp-applicant-row">
              <img src={resolvePortalImageurl(row.imageurl, row.name)} alt="" />
              <div className="cp-applicant-row__info">
                <strong>{row.name}</strong>
                <span>{row.position}</span>
              </div>
              <div className="cp-applicant-meta">
                <span className={`cp-status-pill ${STATUS_CLASS[row.statusKey] || 'cp-status--pending'}`}>
                  {row.status}
                </span>
                <em>{row.time}</em>
              </div>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
