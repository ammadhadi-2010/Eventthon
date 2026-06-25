import React from 'react';

export default function ProjectsProgressBar({ value, showLabel = true }) {
  const pct = Math.min(100, Math.max(0, Number(value) || 0));
  return (
    <div className="ph-table-progress">
      <div className="ph-pcard-progress-track">
        <span style={{ width: `${pct}%` }} />
      </div>
      {showLabel ? <small>{pct}%</small> : null}
    </div>
  );
}
