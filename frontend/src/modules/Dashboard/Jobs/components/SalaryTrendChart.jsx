import React, { useMemo } from 'react';

export default function SalaryTrendChart({ points = [] }) {
  const path = useMemo(() => {
    if (!points.length) return '';
    const w = 100;
    const h = 100;
    const step = w / (points.length - 1 || 1);
    const coords = points.map((p, i) => {
      const x = i * step;
      const y = h - (Math.min(100, Math.max(0, p)) / 100) * h;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    });
    return coords.join(' ');
  }, [points]);

  const areaPath = useMemo(() => {
    if (!path) return '';
    return `${path} L 100 100 L 0 100 Z`;
  }, [path]);

  return (
    <svg className="jh-salary-chart" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="jhSalaryFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(124, 58, 237, 0.45)" />
          <stop offset="100%" stopColor="rgba(124, 58, 237, 0)" />
        </linearGradient>
      </defs>
      {areaPath ? <path className="jh-salary-chart__area" d={areaPath} fill="url(#jhSalaryFill)" /> : null}
      {path ? <path className="jh-salary-chart__line" d={path} fill="none" /> : null}
    </svg>
  );
}
