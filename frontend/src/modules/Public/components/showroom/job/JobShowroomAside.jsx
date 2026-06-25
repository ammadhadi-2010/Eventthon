import React from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import ShowroomPrimaryCta from '../ShowroomPrimaryCta';
import JobSalaryGauge from './JobSalaryGauge';
import JobRemoteMeta from './JobRemoteMeta';
import JobApplicationFlow from './JobApplicationFlow';

export default function JobShowroomAside({ data, isGuest, slug }) {
  const applyPath = `/jobs/${slug}/apply`;
  const benefits = data.remoteBenefits;

  return (
    <aside className="ps-mp-grid__aside" aria-label="Application controls">
      <div className="ps-mp-card ps-mp-card--glow">
        <h2>Application Panel</h2>
        <p style={{ margin: '0 0 0.75rem', fontSize: '0.78rem', color: '#94a3b8' }}>
          Track compensation, remote benefits, and hiring stages before you apply.
        </p>
        <JobSalaryGauge data={data} />
        <JobRemoteMeta remote={data.remote} tags={benefits} />
        <JobApplicationFlow steps={data.applicationFlow} />
        <div className="ps-mp-cta">
          <ShowroomPrimaryCta
            isGuest={isGuest}
            guestLabel="Sign in to Apply"
            signedLabel="Apply Now"
            signedTo={applyPath}
          />
        </div>
        {isGuest ? (
          <Link to="/auth/login" className="ps-mp-secondary-btn">
            <Bell size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Create Job Alert
          </Link>
        ) : (
          <button type="button" className="ps-mp-secondary-btn">
            <Bell size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Create Job Alert
          </button>
        )}
      </div>
    </aside>
  );
}
