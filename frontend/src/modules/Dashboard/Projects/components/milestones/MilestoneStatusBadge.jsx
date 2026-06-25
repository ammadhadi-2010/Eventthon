import React from 'react';

const LABELS = {
  completed: 'Completed',
  'in-progress': 'In Progress',
  pending: 'Pending',
};

export default function MilestoneStatusBadge({ status }) {
  const label = LABELS[status] || status;
  return <span className={`ph-ms-status ph-ms-status--${status}`}>{label}</span>;
}
