import React from 'react';
import FeedEngagementBar from './FeedEngagementBar';
import UserAvatar from './UserAvatar';

/**
 * Compact LinkedIn-style row: avatar | main (body + small actions) | optional right rail.
 */
export default function FeedItem({
  avatarSrc,
  avatarAlt = '',
  avatarSize = 40,
  children,
  rightRail = null,
  onLike,
  onComment,
  onShare,
  className = '',
}) {
  const cn = ['esh-feed-row', rightRail ? 'esh-feed-row--with-rail' : '', className].filter(Boolean).join(' ');
  return (
    <li className={cn}>
      <UserAvatar src={avatarSrc} alt={avatarAlt} size={avatarSize} />
      <div className="esh-feed-row-main">
        {children}
        <FeedEngagementBar
          onLike={onLike}
          onComment={onComment}
          onShare={onShare}
          variant="compact"
          className="esh-engage--compact-under-text"
        />
      </div>
      {rightRail ? <div className="esh-feed-row-rail">{rightRail}</div> : null}
    </li>
  );
}
