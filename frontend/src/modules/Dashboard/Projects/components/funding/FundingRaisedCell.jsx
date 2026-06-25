import React from 'react';

export default function FundingRaisedCell({ raised, raisedPct }) {
  const pct = Math.min(100, Math.max(0, Number(raisedPct) || 0));

  return (
    <div className="ph-fund-raised">
      <div className="ph-fund-raised__top">
        <strong>{raised}</strong>
        <span>{pct}%</span>
      </div>
      <div className="ph-fund-raised__track">
        <span className="ph-fund-raised__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
