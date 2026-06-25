import React, { useState } from 'react';
import { pickImageurl, resolveDashboardMediaUrl } from '../../utils/dashboardMedia';

export default function PostComposerAvatar({ userData }) {
  const [broken, setBroken] = useState(false);
  const src = resolveDashboardMediaUrl(pickImageurl(userData));
  const initial = (userData?.first_name || 'U').charAt(0).toUpperCase();

  return (
    <div className="et-post-box__thumb">
      {src && !broken ? (
        <img
          src={src}
          alt={userData?.first_name || 'You'}
          className="et-post-box__thumb-img"
          onError={() => setBroken(true)}
          loading="lazy"
        />
      ) : (
        initial
      )}
    </div>
  );
}
