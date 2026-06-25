import React from 'react';

export default function AssessmentProgressRing({ percent = 0, label = 'Overall Progress' }) {
  const safe = Math.min(100, Math.max(0, Number(percent) || 0));

  return (
    <div
      className="jh-assess-ring"
      style={{ '--ring-pct': `${safe}%` }}
      role="img"
      aria-label={`${safe}% ${label}`}
    >
      <div className="jh-assess-ring__inner">
        <strong>{safe}%</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}
