import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';

export default function JobsSidebarInsights({ market, loading }) {
  const [isReportOpen, setIsReportOpen] = useState(false);
  const skills = market?.topSkills?.length ? market.topSkills : [];
  const progress = market?.salaryProgressPercent ?? 0;

  return (
    <>
      <div className="gigs-card gigs-side-card">
        <div className="gigs-side-head">
          <h3>Job Market Insights</h3>
          <button type="button" onClick={() => setIsReportOpen(true)}>View Report</button>
        </div>
        <p className="gigs-side-label">Job Openings</p>
        <h4 className="gigs-side-value">{loading ? '…' : market?.openingsLabel || '0'}</h4>
        <p className="gigs-side-positive">Active listings in database</p>
        <div className="gigs-side-wave" aria-hidden="true" />
        <div className="gigs-side-divider" />
        <p className="gigs-side-label">In Demand Skills</p>
        <div className="gigs-side-pills">
          {skills.length === 0 ? (
            <span className="jh-side-empty-pill">{loading ? 'Loading…' : 'No skill tags yet'}</span>
          ) : (
            skills.map((skill) => <span key={skill}>{skill}</span>)
          )}
        </div>
        <div className="gigs-side-divider" />
        <p className="gigs-side-label">Average Salary</p>
        <h4 className="gigs-side-value">{loading ? '…' : market?.averageSalary || '$0k'}</h4>
        <p className="gigs-side-positive">Mean of active job salary bands</p>
        <div className="gigs-side-progress" aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </div>
      </div>

      {isReportOpen ? (
        <div className="gigs-report-overlay" onClick={() => setIsReportOpen(false)}>
          <div className="gigs-report-modal" onClick={(e) => e.stopPropagation()}>
            <div className="gigs-report-head">
              <h3>Job Market Report</h3>
              <button type="button" onClick={() => setIsReportOpen(false)} aria-label="Close report">
                <FiX size={16} />
              </button>
            </div>
            <p className="gigs-report-sub">
              {market?.openingsLabel || '0'} open roles · avg {market?.averageSalary || '—'} across active listings.
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
