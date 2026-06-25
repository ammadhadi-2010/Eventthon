import React from 'react';

export default function MyProjectsProgress({ value, status, tone }) {
  const pct = Math.min(100, Math.max(0, Number(value) || 0));
  const variant = tone || status;

  return (
    <div className="ph-mp-progress">
      <span className="ph-mp-progress-pct">{pct}%</span>
      <div className="ph-mp-progress-track">
        <span className={`ph-mp-progress-fill ph-mp-progress-fill--${variant}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
