import React from 'react';
import { FiThumbsUp } from 'react-icons/fi';

export default function PostActionsStats({
  likesCount,
  commentsCount,
  sendCount,
  viewCount,
}) {
  return (
    <div className="post-actions__stats-row">
      <div className="post-actions__reactions">
        {likesCount > 0 ? (
          <div className="post-actions__like-badge" aria-hidden>
            <FiThumbsUp size={10} color="white" fill="white" />
          </div>
        ) : null}
        <span className="post-actions__stat-text">
          {likesCount > 0 ? likesCount : '0'} reactions
        </span>
      </div>
      <span className="post-actions__stat-text">
        {commentsCount} comments • {sendCount} sends • {viewCount} views
      </span>
    </div>
  );
}
