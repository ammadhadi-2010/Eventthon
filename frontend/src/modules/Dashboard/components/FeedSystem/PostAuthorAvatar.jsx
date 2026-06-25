import React, { useState } from 'react';
import { resolvePostAuthorAvatar } from './feedPostMedia';

export default function PostAuthorAvatar({ post, userData, borderColor }) {
  const [broken, setBroken] = useState(false);
  const src = resolvePostAuthorAvatar(post, userData);
  const initial = (post?.author_name || 'U').charAt(0).toUpperCase();

  return (
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
