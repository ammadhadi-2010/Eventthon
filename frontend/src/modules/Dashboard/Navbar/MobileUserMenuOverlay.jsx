import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import UserMenu from './UserMenu';
import './user-menu-mobile.css';

export default function MobileUserMenuOverlay({ open, user, onClose }) {
  useEffect(() => {
    if (!open) return undefined;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="et-user-menu-mobile-root" role="presentation">
      <button
        type="button"
        className="et-user-menu-mobile-overlay"
        aria-label="Close profile menu"
        onClick={onClose}
      />
      <div
        className="et-user-menu-mobile-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Profile menu"
        onMouseDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
        onTouchStart={(event) => event.stopPropagation()}
      >
        <UserMenu user={user} onClose={onClose} mobileSheet />
      </div>
    </div>,
    document.body,
  );
}
