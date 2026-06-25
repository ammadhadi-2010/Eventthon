import { useEffect, useState } from 'react';

const MOBILE_MQ = '(max-width: 1023px)';

/** True when dashboard mobile hub layout should apply (matches Gigs/Squads breakpoint). */
export function useMobileHub() {
  const [mobile, setMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(MOBILE_MQ).matches;
  });

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const onChange = () => setMobile(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return mobile;
}
