import React from 'react';

const DEFAULT_ACTIONS = [
  { key: 'like', label: 'Like', icon: '❤️' },
  { key: 'comment', label: 'Comment', icon: '💬' },
  { key: 'share', label: 'Share', icon: '🚀' },
];

/**
 * Like / comment / share row for feed-style surfaces (profile activity, newsfeed, etc.).
 * `variant="compact"` — small icons, no labels, minimal padding (under activity text).
 */
export default function FeedEngagementBar({
  onLike,
  onComment,
  onShare,
  className = '',
  actions = DEFAULT_ACTIONS,
  variant = 'default',
}) {
  const handlers = { like: onLike, comment: onComment, share: onShare };
  const cn = ['esh-engage', variant === 'compact' && 'esh-engage--compact', className].filter(Boolean).join(' ');
  return (
    <div className={cn} role="group" aria-label="Interactions">
      {actions.map((a) => (
        <button
          key={a.key}
          type="button"
          className="esh-engage-btn"
          aria-label={a.label}
          onClick={handlers[a.key]}
        >
          <span className="esh-engage-ico" aria-hidden="true">
            {a.icon}
          </span>
          {variant === 'compact' ? null : <span className="esh-engage-hint">{a.label}</span>}
        </button>
      ))}
    </div>
  );
}
