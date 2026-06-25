import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

export default function useShowroomAuth(forceGuest = false) {
  const location = useLocation();
  const isPublicRoute = location.pathname.startsWith('/public');

  return useMemo(() => {
    const hasSession = Boolean(
      !forceGuest &&
        (localStorage.getItem('userEmail') || localStorage.getItem('userMobile')),
    );
    const isGuest = forceGuest || isPublicRoute;
    const canManage = hasSession && !isGuest;
    return { isGuest, canManage, isPublicRoute, hasSession };
  }, [forceGuest, isPublicRoute, location.pathname]);
}
