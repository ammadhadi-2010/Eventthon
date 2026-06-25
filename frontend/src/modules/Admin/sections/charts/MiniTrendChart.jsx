import React from 'react';

export default function MiniTrendChart({ color = '#8b5cf6', points = [] }) {
  const path = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${index * 22} ${38 - point}`)
    .join(' ');

  return (
    <svg viewBox="0 0 132 42" className="h-full w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`mini-${color.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.8" />
          <stop offset="100%" stopColor={color} stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <path d={`${path} L 132 42 L 0 42 Z`} fill={`url(#mini-${color.replace('#', '')})`} opacity="0.35" />
      <path d={path} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
