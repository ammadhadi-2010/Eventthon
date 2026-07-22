import { useEffect, useState } from 'react';
import { fetchProfileMe } from '../Profile/services/profileService';
import { persistUserSession, readStoredUserStub } from '../../../utils/storedUser';

function resolveProfileIdentifier(userData) {
  return (
    userData?.email ||
    userData?.mobile ||
    localStorage.getItem('userEmail') ||
    localStorage.getItem('userMobile') ||
    ''
  );
}

/** Always prefer fresh profile API data over stale localStorage session cache. */
export function useLiveProfileCard(userData) {
  const [profile, setProfile] = useState(userData || readStoredUserStub());

  useEffect(() => {
    if (userData) setProfile(userData);
  }, [userData]);

  useEffect(() => {
    const identifier = resolveProfileIdentifier(userData);
    if (!identifier) return undefined;

    let cancelled = false;

    const syncProfile = async () => {
      try {
        const fresh = await fetchProfileMe(identifier);
        if (cancelled || !fresh) return;
        persistUserSession(fresh);
        setProfile(fresh);
        window.dispatchEvent(new CustomEvent('et:profile-card-synced', { detail: fresh }));
      } catch {
        /* keep last known profile */
      }
    };

    syncProfile();
    const onUpdated = () => syncProfile();
    window.addEventListener('et:profile-updated', onUpdated);
    window.addEventListener('focus', onUpdated);

    return () => {
      cancelled = true;
      window.removeEventListener('et:profile-updated', onUpdated);
      window.removeEventListener('focus', onUpdated);
    };
  }, [userData?.email, userData?.mobile, userData?._id]);

  return profile || userData || readStoredUserStub();
}
