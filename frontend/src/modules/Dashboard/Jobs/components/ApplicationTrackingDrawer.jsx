import React from 'react';
import { FiX } from 'react-icons/fi';
import JobApplicationFlow from '../../../Public/components/showroom/job/JobApplicationFlow';
import { RECRUITER_ACTIONS, statusMeta } from '../utils/applicationStatus';

export default function ApplicationTrackingDrawer({
  application,
  onClose,
  onAdvanceStatus,
}) {
  if (!application) return null;

  const status = statusMeta(application.status);

  return (
    <div className="jh-track-overlay" role="dialog" aria-modal="true" aria-label="Application tracking">
      <button type="button" className="jh-track-overlay__backdrop" onClick={onClose} aria-label="Close" />
      <aside className="jh-track-drawer gigs-card">
        <header className="jh-track-drawer__head">
          <div>
            <h3>{application.role}</h3>
            <p>
              {application.company} · Applied {application.appliedOn}
            </p>
            <span className={`jh-app-row__badge jh-app-row__badge--${status.tone}`}>
              {status.label}
            </span>
          </div>
          <button type="button" className="jh-track-drawer__close" onClick={onClose} aria-label="Close drawer">
            <FiX size={18} />
          </button>
        </header>

        <JobApplicationFlow steps={application.flowSteps} />

        <div className="jh-track-drawer__actions">
          <p className="jh-track-drawer__actions-label">Recruiter actions (simulate)</p>
          {RECRUITER_ACTIONS.map((action) => (
            <button
              key={action.id}
              type="button"
              className="jobs-alert-btn jh-track-drawer__action-btn"
              onClick={() => onAdvanceStatus?.(application.id, action.id, action.label)}
            >
              {action.label}
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}
