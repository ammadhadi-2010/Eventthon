import React, { useState } from 'react';
import { FiPlus } from 'react-icons/fi';

const FollowButton = ({ userId, initialIsFollowing = false }) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);

  const handleFollow = (e) => {
    e.stopPropagation();
    setIsFollowing(!isFollowing);
    // Yahan API call aa jaye gi baad mein
  };

  return (
    <button onClick={handleFollow} style={isFollowing ? followedBtn : followBtn}>
      {!isFollowing && <FiPlus size={14} />}
      {isFollowing ? 'Following' : 'Follow'}
    </button>
  );
};

const followBtn = {
  background: 'none', border: 'none', color: '#60a5fa', fontWeight: '700',
  fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
};

const followedBtn = {
  background: 'none', border: 'none', color: '#94a3b8', fontWeight: '600',
  fontSize: '13px', cursor: 'pointer'
};

export default FollowButton;