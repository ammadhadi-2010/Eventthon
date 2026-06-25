import React, { useEffect, useMemo, useState } from 'react';
import { readStoredUserStub } from '../../../../utils/storedUser';
import { getAvatarUrl } from '../../Navbar/userMenuUtils';

/** Profile avatar for mobile hub top bars (before search). */
export default function MobileHubAvatarButton({
  btnClassName,
  imgClassName,
  onClick,
  ariaLabel = 'Open profile menu',
  user = null,
}) {
  const userKey = user
    ? `${user.profile_image_url ?? ''}|${user.avatar ?? ''}|${user.profile_image ?? ''}|${user.imageurl ?? ''}|${user.email ?? ''}|${user.first_name ?? ''}|${user.last_name ?? ''}`
    : 'session';

  const sessionUser = useMemo(
    () => user || readStoredUserStub(),
    [user, userKey],
  );
  const [avatarSrc, setAvatarSrc] = useState(() => getAvatarUrl(sessionUser));

  useEffect(() => {
    setAvatarSrc(getAvatarUrl(sessionUser));
  }, [sessionUser]);

  return (
    <button type="button" className={btnClassName} onClick={onClick} aria-label={ariaLabel}>
      <img
        src={avatarSrc}
        alt=""
        className={imgClassName}
        onError={() => setAvatarSrc(getAvatarUrl(null))}
      />
    </button>
  );
}
