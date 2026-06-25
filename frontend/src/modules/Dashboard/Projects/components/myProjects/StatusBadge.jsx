import React from 'react';
import { STATUS_LABELS } from '../../data/projectsHubData';

export default function StatusBadge({ status }) {
  const label = STATUS_LABELS[status] || status;
  return <span className={`ph-mp-status ph-mp-status--${status}`}>{label}</span>;
}
