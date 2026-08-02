import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { resolvePostAuthorAvatar } from './feedPostMedia';
import { profileSubjectFromPost, resolveUserProfilePath } from '../../Profile/utils/profileLinks';

export default function PostAuthorAvatar({ post, userData, borderColor }) {
  const [broken, setBroken] = useState(false);
  const src = resolvePostAuthorAvatar(post, userData);
  useEffect(() => {
    setBroken(false);
  }, [src]);
  const initial = (post?.author_name || 'U').charAt(0).toUpperCase();
  const profilePath = resolveUserProfilePath(profileSubjectFromPost(post), userData);

  return (
    <Link
      to={profilePath}
      className="feed-post-avatar-link"
      aria-label={`View ${post?.author_name || 'author'} profile`}
      onClick={(event) => event.stopPropagation()}
    >
      <div style={{ ...avatarBox, borderColor: borderColor || 'rgba(255,255,255,0.1)' }}>
        {src && !broken ? (
          <img
            src={src}
            alt={post?.author_name || 'Author'}
            style={avatarImg}
            onError={() => setBroken(true)}
            loading="lazy"
          />
        ) : (
          <span>{initial}</span>
        )}
      </div>
    </Link>
  );
}

const avatarBox = {
  width: '42px',
  height: '42px',
  borderRadius: '10px',
  background: '#1e293b',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
  border: '2px solid rgba(255,255,255,0.1)',
  color: '#fff',
  overflow: 'hidden',
  flexShrink: 0,
};

const avatarImg = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
};
