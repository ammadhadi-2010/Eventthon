import React from 'react';
import EventThonBadge from '../../../../components/EventThonBadge';
import { rowToBadgeProps } from '../../../../components/badgeTierProps';

export default function RankBadgeViewport({ row, size = 'md' }) {
  const props = rowToBadgeProps(row);

  return (
    <EventThonBadge tier={props.tier} label={props.label} size={size} />
  );
}
