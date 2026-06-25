import React from 'react';
import { resolveBrandIcon } from '../../utils/showroomBrandIcons';

export default function ShowroomStackTag({ label }) {
  const { Icon, tone } = resolveBrandIcon(label);
  return (
    <span className={`ps-tag ps-tag--brand ps-tag--${tone}`}>
      <Icon size={12} aria-hidden />
      {label}
    </span>
  );
}
