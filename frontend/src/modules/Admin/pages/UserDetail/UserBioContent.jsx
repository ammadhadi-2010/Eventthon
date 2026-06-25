import React from 'react';

const HTML_TAG = /<[a-z][\s\S]*>/i;

/** Renders plain text or trusted profile-preview HTML without leaking raw markup. */
export default function UserBioContent({ bio, className = 'ud-bio', emptyText = 'No bio provided yet.' }) {
  const raw = (bio || '').trim();
  if (!raw) return <p className={className}>{emptyText}</p>;
  if (HTML_TAG.test(raw)) {
    return (
      <div
        className={`${className} ${className}--html`}
        dangerouslySetInnerHTML={{ __html: raw }}
      />
    );
  }
  return <p className={className}>{raw}</p>;
}
