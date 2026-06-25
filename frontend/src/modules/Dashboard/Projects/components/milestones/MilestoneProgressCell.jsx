import React from 'react';

export default function MilestoneProgressCell({ progress, status }) {
  const pct = Math.min(100, Math.max(0, Number(progress) || 0));

  return (
    <div className="ph-ms-progress">
      <span className="ph-ms-progress-pct">{pct}%</span>
      <div className="ph-ms-progress-track">
        <span className={`ph-ms-progress-fill ph-ms-progress-fill--${status}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
