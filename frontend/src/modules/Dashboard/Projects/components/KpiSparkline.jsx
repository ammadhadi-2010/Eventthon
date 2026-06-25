import React from 'react';

export default function KpiSparkline({ path, tone = 'violet' }) {
  return (
    <svg className={`ph-kpi-spark ph-kpi-spark--${tone}`} viewBox="0 0 40 24" preserveAspectRatio="none" aria-hidden>
      <path d={path} />
    </svg>
  );
}
