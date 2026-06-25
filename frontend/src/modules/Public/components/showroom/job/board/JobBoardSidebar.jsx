import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Globe, Heart, Laptop, Sparkles } from 'lucide-react';
import JobApplicationFlow from '../JobApplicationFlow';
import { JOB_BOARD_STATS } from './jobBoardUtils';

const META_ICONS = [Globe, Laptop, Sparkles, Heart];

export default function JobBoardSidebar({
  isGuest,
  jobCount,
  avgSalary,
  remoteBenefits,
  applicationFlow,
}) {
  const meta = remoteBenefits?.length
    ? remoteBenefits
    : ['Work From Anywhere', 'Flexible Hours', 'Learning Budget', 'Mental Health Support'];

  return (
    <aside className="ps-mp-grid__aside ps-jb-sidebar ps-jb-sidebar-rail" aria-label="Job board sidebar">
      <div className="ps-mp-card ps-mp-card--glow">
        <h2>Job Search Summary</h2>
        <p className="ps-jb-summary-line">
          <span>Jobs found</span>
          <strong>{jobCount}</strong>
        </p>
        <p className="ps-jb-summary-line">
          <span>Avg. salary</span>
          <strong>{avgSalary || JOB_BOARD_STATS[3].value}</strong>
        </p>
        <button type="button" className="ps-mp-secondary-btn">
          Save This Search
        </button>
      </div>

      <div className="ps-mp-card">
        <h2>Remote Benefits</h2>
        <div className="ps-mp-meta-tags">
          {meta.map((label, idx) => {
            const Icon = META_ICONS[idx % META_ICONS.length];
            return (
              <span key={label} className="ps-mp-meta-tag">
                <Icon size={11} aria-hidden />
                {label}
              </span>
            );
          })}
        </div>
      </div>

      <div className="ps-mp-card">
        <JobApplicationFlow steps={applicationFlow} />
      </div>

      <div className="ps-mp-card ps-jb-alert-card">
        <h2>Job Alerts</h2>
        <p className="ps-mp-prose">Get notified when new remote roles match your skills.</p>
        {isGuest ? (
          <Link to="/auth/login" className="ps-btn ps-btn--primary ps-btn--wide">
            <Bell size={14} aria-hidden />
            Create Alert
          </Link>
        ) : (
          <Link to="/jobs/alerts/new" className="ps-btn ps-btn--primary ps-btn--wide">
            <Bell size={14} aria-hidden />
            Create Alert
          </Link>
        )}
      </div>
    </aside>
  );
}
