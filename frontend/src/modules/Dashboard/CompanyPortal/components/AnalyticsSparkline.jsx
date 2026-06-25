import React, { useMemo } from 'react';

export default function AnalyticsSparkline({ tone = 0 }) {
  const gradId = `cpSparkGrad-${tone}`;
  const path = useMemo(() => {
    const pts = [12, 18, 14, 22, 16, 26, 20, 28, 24, 32].map((y, i) => {
      const x = 4 + i * 9;
      const v = y + (tone % 5) * 2;
      return `${i === 0 ? 'M' : 'L'}${x},${40 - v}`;
    });
    return pts.join(' ');
  }, [tone]);

  return (
    <svg className="cp-sparkline" viewBox="0 0 88 40" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(139, 92, 246, 0.55)" />
          <stop offset="100%" stopColor="rgba(139, 92, 246, 0)" />
        </linearGradient>
      </defs>
      <path d={`${path} L84 40 L4 40 Z`} fill={`url(#${gradId})`} opacity="0.35" />
      <path d={path} fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
