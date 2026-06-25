import React from 'react';

export default function PostAuthorRankBadge({ rankMeta }) {
  const label = String(rankMeta?.label || '').trim();
  if (!label) return null;

  return (
    <span className="feed-post-rank-chip">{label}</span>
  );
}
