import { useEffect, useState } from 'react';

export default function useSquadHubMobileScroll() {
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const mobile = window.matchMedia('(max-width: 1023px)');
    if (!mobile.matches) return undefined;

    const scrollRoot = document.querySelector('main.et-main-scroll') || window;
    const getScrollY = () => (scrollRoot === window ? window.scrollY : scrollRoot.scrollTop);

    const handleScroll = () => {
      const current = getScrollY();
      if (current > lastScrollY && current > 50) setIsHeaderVisible(false);
      else setIsHeaderVisible(true);
      setLastScrollY(current);
    };

    scrollRoot.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollRoot.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return { isHeaderVisible };
}
