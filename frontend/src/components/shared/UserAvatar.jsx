import React from 'react';

/**
 * Circular user avatar; size in px. Styling lives in `shared.css` (`.esh-avatar`).
 */
export default function UserAvatar({ src, alt = '', size = 44, className = '' }) {
  const cn = ['esh-avatar', className].filter(Boolean).join(' ');
  return <img className={cn} src={src} alt={alt} width={size} height={size} style={{ width: size, height: size }} />;
}
