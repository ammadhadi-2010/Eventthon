import { useCallback, useEffect, useRef, useState } from 'react';

export default function useCompanyMobileScrollChrome() {
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const scrollRoot = document.querySelector('main.et-main-scroll') || window;
    const getScrollY = () => (scrollRoot === window ? window.scrollY : scrollRoot.scrollTop);

    const handleScroll = () => {
      const currentScrollY = getScrollY();
      if (currentScrollY > lastScrollY.current && currentScrollY > 60) {
        setIsHeaderVisible(false);
      } else {
        setIsHeaderVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    scrollRoot.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollRoot.removeEventListener('scroll', handleScroll);
  }, []);

  const resetChrome = useCallback(() => {
    setIsHeaderVisible(true);
    lastScrollY.current = 0;
  }, []);

  return { isHeaderVisible, resetChrome };
}
