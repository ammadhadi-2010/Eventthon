import { useEffect, useState } from 'react';

export function useAlertCenterScrollChrome() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScroll, setLastScroll] = useState(0);

  useEffect(() => {
    const scrollRoot = document.querySelector('main.et-main-scroll') || window;
    const getScrollY = () => (scrollRoot === window ? window.scrollY : scrollRoot.scrollTop);

    const monitorScroll = () => {
      const currentScroll = getScrollY();
      if (currentScroll > lastScroll && currentScroll > 60) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScroll(currentScroll);
    };

    scrollRoot.addEventListener('scroll', monitorScroll, { passive: true });
    return () => scrollRoot.removeEventListener('scroll', monitorScroll);
  }, [lastScroll]);

  return { isVisible };
}
