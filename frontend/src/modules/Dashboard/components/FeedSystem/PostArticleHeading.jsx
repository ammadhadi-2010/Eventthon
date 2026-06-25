import React from 'react';

export default function PostArticleHeading({ title = '' }) {
  const cleaned = String(title || '').trim();

  if (!cleaned) return null;

  return (
    <h3 className="m-0 mb-1.5 text-base font-bold leading-snug tracking-tight text-slate-100 md:text-lg">
      {cleaned}
    </h3>
  );
}
