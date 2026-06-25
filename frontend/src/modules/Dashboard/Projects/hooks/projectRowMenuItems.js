export function buildOwnerProjectMenuItems({ row, onView, onAction }) {
  const status = row.status || '';
  const onHold = status === 'on-hold';
  const completed = status === 'completed';

  return [
    { id: 'view', label: 'View details', onClick: () => onView?.(row) },
    { id: 'duplicate', label: 'Duplicate', onClick: () => onAction?.(row, 'duplicate') },
    !completed
      ? {
          id: 'hold',
          label: onHold ? 'Resume project' : 'Put on hold',
          onClick: () => onAction?.(row, onHold ? 'resume' : 'hold'),
        }
      : null,
    !completed
      ? { id: 'complete', label: 'Mark complete', onClick: () => onAction?.(row, 'complete') }
      : null,
    { id: 'delete', label: 'Delete', danger: true, onClick: () => onAction?.(row, 'delete') },
  ].filter(Boolean);
}

export function buildSavedProjectMenuItems({ row, onView, onShare, onUnsave }) {
  return [
    { id: 'view', label: 'View project', onClick: () => onView?.(row) },
    { id: 'share', label: 'Copy link', onClick: () => onShare?.(row) },
    { id: 'unsave', label: 'Remove from saved', danger: true, onClick: () => onUnsave?.(row) },
  ];
}
