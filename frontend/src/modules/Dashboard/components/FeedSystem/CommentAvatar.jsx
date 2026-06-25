import React, { memo, useState } from 'react';
import { resolveCommentAvatar } from './commentIdentity';

const SIZES = { sm: 32, md: 40, lg: 48 };

/**
 * High-fidelity profile avatar for comment threads.
 */
const CommentAvatar = memo(function CommentAvatar({
  person = {},
  currentUser = null,
  size = 'md',
  className = '',
}) {
  const px = typeof size === 'number' ? size : SIZES[size] || SIZES.md;
  const [failed, setFailed] = useState(false);
  const src = resolveCommentAvatar(person, currentUser);
  const name = person?.author_name || person?.name || 'User';
  const initial = name.charAt(0).toUpperCase() || 'U';

  if (failed) {
    return (
      <span
        className={`cm-avatar cm-avatar--fallback ${className}`.trim()}
        style={{ width: px, height: px, fontSize: Math.round(px * 0.38) }}
        aria-hidden
      >
        {initial}
      </span>
    );
  }

  return (
    <img
      className={`cm-avatar ${className}`.trim()}
      src={src}
      alt=""
      width={px}
      height={px}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
});

export default CommentAvatar;
