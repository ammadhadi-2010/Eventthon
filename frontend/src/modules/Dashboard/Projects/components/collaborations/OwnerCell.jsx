import React from 'react';

export default function OwnerCell({ name, initials, isYou }) {
  const label = isYou ? 'You' : name;
  const av = isYou ? 'Y' : initials;

  return (
    <div className="ph-col-owner">
      <span className={`ph-col-owner-av${isYou ? ' is-you' : ''}`}>{av}</span>
      <span className="ph-col-owner-name">{label}</span>
    </div>
  );
}
