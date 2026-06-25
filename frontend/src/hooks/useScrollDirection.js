import { useState, useEffect } from 'react';

export const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState('up');

  useEffect(() => {
    const scrollRoot = document.querySelector('main.et-main-scroll') || window;
    const getScrollY = () => (scrollRoot === window ? window.pageYOffset : scrollRoot.scrollTop);

    let lastScrollY = getScrollY();

    const updateScrollDirection = () => {
      const scrollY = getScrollY();
      const direction = scrollY > lastScrollY ? 'down' : 'up';

      // Threshold check to prevent rapid flickering on tiny micro-scrolls
      if (scrollY - lastScrollY > 10 || scrollY - lastScrollY < -10) {
        setScrollDirection(direction);
      }
      lastScrollY = scrollY > 0 ? scrollY : 0;
    };

    scrollRoot.addEventListener('scroll', updateScrollDirection, { passive: true });
    return () => scrollRoot.removeEventListener('scroll', updateScrollDirection);
  }, []);

  return scrollDirection;
};
