import { useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';

function isMobileViewport() {
  return typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches;
}

export default function GigsFilterFloatingDrop({ open, anchorRef, children, className = '' }) {
  const [coords, setCoords] = useState(null);

  useLayoutEffect(() => {
    if (!open || !isMobileViewport()) {
      setCoords(null);
      return undefined;
    }

    const updatePosition = () => {
      const anchor = anchorRef?.current;
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      const width = Math.min(224, window.innerWidth - 16);
      const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8));
      setCoords({ top: rect.bottom + 4, left, width });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, anchorRef]);

  if (!open || !coords || !isMobileViewport()) return null;

  const rootClass = ['gigs-filter-floating-drop', className].filter(Boolean).join(' ');

  return createPortal(
    <div
      className={rootClass}
      style={{
        position: 'fixed',
        top: coords.top,
        left: coords.left,
        width: coords.width,
        zIndex: 999999,
      }}
    >
      {children}
    </div>,
    document.body,
  );
}
