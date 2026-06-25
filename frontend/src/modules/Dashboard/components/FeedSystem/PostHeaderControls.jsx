import React from 'react';
import { FiX } from 'react-icons/fi';
import PostOptions from '../Global/PostOptions';

export default function PostHeaderControls({
  postId,
  postType,
  onDeleted,
  userData,
  onDismiss,
  authorName,
}) {
  const handleFollow = () => {
    alert(`Following ${authorName || 'member'}...`);
  };

  return (
    <div className="feed-post-header__actions">
      <button type="button" className="feed-post-header__follow" onClick={handleFollow}>
        Follow
      </button>
      <PostOptions
        postId={postId}
        postType={postType}
        onDeleted={onDeleted}
        userData={userData}
        variant="feed"
      />
      <button
        type="button"
        className="feed-post-header__dismiss"
        onClick={onDismiss}
        aria-label="Dismiss post"
      >
        <FiX size={16} strokeWidth={2.25} />
      </button>
    </div>
  );
}
