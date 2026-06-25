import React from 'react';
import { getRankBadgeSrc, normalizeTierKey } from './rankBadgeImages';
import './rank-badge.css';

const VARIANT_CLASS = {
  sm: 'et-rank-badge--sm',
  md: 'et-rank-badge--md',
  lg: 'et-rank-badge--lg',
  profile: 'et-rank-badge--profile',
  hero: 'et-rank-badge--hero',
  criteria: 'et-rank-badge--criteria',
  preview: 'et-rank-badge--preview',
};

export default function EventThonBadge({
  tier = 'E1',
  label = 'Rank badge',
  size = 'md',
  variant = '',
  className = '',
  imgClassName = '',
}) {
  const tierKey = normalizeTierKey(tier);
  const src = getRankBadgeSrc(tierKey);
  const variantKey = variant || size;
  const imgCls = imgClassName || `${VARIANT_CLASS[variantKey] || VARIANT_CLASS.md} et-rank-badge-img`;

  return (
    <span className={`inline-flex items-center justify-center flex-shrink-0 ${className}`.trim()}>
      <img
        src={src}
        alt={label}
        className={imgCls}
        loading="lazy"
        draggable={false}
      />
    </span>
  );
}
