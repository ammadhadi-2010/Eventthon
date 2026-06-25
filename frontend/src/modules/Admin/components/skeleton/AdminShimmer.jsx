import React from 'react';

export function AdminShimmer({ className = '', style }) {
  return <div className={`admin-shimmer ${className}`.trim()} style={style} aria-hidden />;
}

export function AdminShimmerRow({ cols = 4 }) {
  return (
    <tr className="border-t border-white/5">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-5 py-3">
          <AdminShimmer className="h-4 w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  );
}
