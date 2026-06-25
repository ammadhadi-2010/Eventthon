import React from 'react';

export default function AreaTrendChart({ points = [], color = '#8b5cf6', labels = [] }) {
  const width = 420;
  const height = 180;
  const max = Math.max(...points, 1);
  const stepX = width / Math.max(points.length - 1, 1);

  const coords = points.map((point, index) => {
    const x = index * stepX;
    const y = height - (point / max) * 130 - 18;
    return { x, y };
  });

  const line = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
  const area = `${line} L ${width} ${height} L 0 ${height} Z`;

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-[190px] w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`area-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[30, 70, 110, 150].map((y) => (
          <line key={y} x1="0" y1={y} x2={width} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        ))}
        <path d={area} fill={`url(#area-${color.replace('#', '')})`} />
        <path d={line} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
        {coords.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r="3.2" fill={color} />
        ))}
      </svg>

      <div className="mt-2 flex justify-between text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
        {labels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  );
}
