import React from 'react';
import { formatMetricCount } from './profilePostsUtils';

const METRICS = [
  { key: 'views', emoji: '👁️', label: 'Views' },
  { key: 'likes', emoji: '❤️', label: 'Likes' },
  { key: 'comments', emoji: '💬', label: 'Comments' },
  { key: 'shares', emoji: '🔄', label: 'Shares' },
];

const ACTIONS = [
  { key: 'view', emoji: '👁️', label: 'View' },
  { key: 'edit', emoji: '✏️', label: 'Edit' },
  { key: 'analytics', emoji: '📊', label: 'Analytics' },
  { key: 'delete', emoji: '🗑️', label: 'Delete', danger: true },
];

export default function PostMetricsBar({ metrics = {}, status = 'published', onAction }) {
  if (status === 'draft') {
    return (
      <div className="pposts-metrics pposts-metrics--draft">
        <button type="button" className="pposts-metrics__draft-edit" onClick={() => onAction?.('edit')}>
          Continue Editing
        </button>
        <button type="button" className="pposts-metrics__draft-delete" onClick={() => onAction?.('delete')}>
          Delete
        </button>
      </div>
    );
  }

  return (
    <div className="pposts-metrics">
      <div className="pposts-metrics__stats" aria-label="Engagement metrics">
        {METRICS.map((item) => (
          <span key={item.key} className="pposts-metrics__stat">
            <span aria-hidden>{item.emoji}</span>
            <span className="pposts-metrics__stat-value">
              {formatMetricCount(metrics[item.key] || 0)}
            </span>
            <span className="pposts-metrics__stat-label">{item.label}</span>
          </span>
        ))}
      </div>

      <div className="pposts-metrics__actions" aria-label="Post actions">
        {ACTIONS.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`pposts-metrics__action${item.danger ? ' is-danger' : ''}`}
            onClick={() => onAction?.(item.key)}
          >
            <span aria-hidden>{item.emoji}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
