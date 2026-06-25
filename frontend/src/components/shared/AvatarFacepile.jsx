import React from 'react';

/** Horizontal overlapping avatars with a “+” between first and second (e.g. follows). */
export default function AvatarFacepile({ urls = [], className = '' }) {
  if (!urls.length) return null;
  const [a, b, c] = urls;
  const cn = ['esh-facepile', className].filter(Boolean).join(' ');
  return (
    <div className={cn} aria-hidden="true">
      {a ? <img src={a} alt="" /> : null}
      {b ? <span className="esh-facepile-plus">+</span> : null}
      {b ? <img src={b} alt="" /> : null}
      {c ? <img src={c} alt="" /> : null}
    </div>
  );
}
