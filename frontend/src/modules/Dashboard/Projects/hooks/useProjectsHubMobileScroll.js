import { useCallback, useEffect } from 'react';

export function resetProjectsHubScroll() {
  const scrollRoot = document.querySelector('main.et-main-scroll') || window;
  if (scrollRoot === window) {
    window.scrollTo(0, 0);
  } else {
    scrollRoot.scrollTop = 0;
  }
}

export default function useProjectsHubMobileScroll(pathname, activeMenu) {
  const reset = useCallback(() => {
    resetProjectsHubScroll();
  }, []);

  useEffect(() => {
    reset();
    const frame = requestAnimationFrame(reset);
    return () => cancelAnimationFrame(frame);
  }, [pathname, activeMenu, reset]);
}
