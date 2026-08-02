import React, { useMemo } from 'react';

const SHADE_STROKE = {
  plasma: '#c084fc',
  cobalt: '#60a5fa',
  mint: '#34d399',
  solar: '#fbbf24',
  coral: '#fb7185',
  aurora: '#2dd4bf',
};

export default function AnalyticsSparkline({ series = [], shade = 'plasma', tone = 0 }) {
  const values = useMemo(
    () => (Array.isArray(series) ? series.map((n) => Number(n) || 0) : []),
    [series],
  );
  const hasData = values.some((n) => n > 0);
  const gradId = `cpSparkGrad-${shade}-${tone}`;
  const stroke = SHADE_STROKE[shade] || SHADE_STROKE.plasma;

  const path = useMemo(() => {
    if (!hasData) return '';
    const max = Math.max(...values, 1);
    const w = 88;
    const h = 40;
    const step = values.length > 1 ? (w - 8) / (values.length - 1) : 0;
    return values
      .map((v, i) => {
        const x = 4 + i * step;
        const y = h - 4 - (v / max) * (h - 10);
        return `${i === 0 ? 'M' : 'L'}${x},${y}`;
      })
      .join(' ');
  }, [hasData, values]);

  if (!hasData) return null;

  return (
    <svg className="cp-sparkline" viewBox="0 0 88 40" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.55" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L84 40 L4 40 Z`} fill={`url(#${gradId})`} opacity="0.4" />
      <path d={path} fill="none" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
