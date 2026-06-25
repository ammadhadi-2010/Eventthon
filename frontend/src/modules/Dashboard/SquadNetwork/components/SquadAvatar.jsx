import React from 'react';
import { getSquadImageUrl, getSquadInitials } from '../utils/squadAvatar';

const SIZE_CLASS = {
  sm: 'sq-avatar--sm',
  md: 'sq-avatar--md',
  lg: 'sq-avatar--lg',
};

export default function SquadAvatar({ squad, size = 'md', className = '', showOnlineDot = false }) {
  const src = getSquadImageUrl(squad);
  const initials = getSquadInitials(squad);
  const sizeClass = SIZE_CLASS[size] || SIZE_CLASS.md;

  return (
    <div className={`sq-avatar ${sizeClass} ${className}`.trim()} aria-hidden={!squad}>
      {src ? (
        <img src={src} alt="" className="sq-avatar__img" />
      ) : (
        <span className="sq-avatar__fallback">{initials}</span>
      )}
      {showOnlineDot ? <span className="sq-avatar__dot" /> : null}
    </div>
  );
}
