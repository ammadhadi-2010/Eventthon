import React from 'react';
import { OUTREACH_STATUS_META } from './outreachData';

export default function OutreachStatusBadge({ status }) {
  const meta = OUTREACH_STATUS_META[status] || OUTREACH_STATUS_META.not_contacted;
  return (
    <span className={`eo-status eo-status--${meta.tone}`}>
      {meta.label}
    </span>
  );
}
