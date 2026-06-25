import React from 'react';
import { timeAgo, isWithinLastHour } from './utils/relativeActivityTime';

/** Relative time with optional “live” dot for activity in the last hour. */
export default function ActivityTimestamp({ createdAt, className = '', compact = false }) {
  const recent = isWithinLastHour(createdAt);
  const label = createdAt ? timeAgo(createdAt) || 'Recently' : 'Recently';
  const cn = ['esh-activity-ts', compact && 'esh-activity-ts--compact', className].filter(Boolean).join(' ');
  return (
    <div className={cn}>
      {recent ? (
        <span className="esh-activity-ts-dot" title="Within the last hour" aria-hidden="true" />
      ) : null}
      <span className="esh-activity-ts-text">{label}</span>
    </div>
  );
}
