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

  if (!open) return null;

  return createPortal(
    <>
      <button
        type="button"
        className="et-user-menu-mobile-overlay"
        aria-label="Close profile menu"
        onClick={onClose}
      />
      <div className="et-user-menu-mobile-panel" role="dialog" aria-modal="true" aria-label="Profile menu">
        <UserMenu user={user} onClose={onClose} mobileSheet />
      </div>
    </>,
    document.body,
  );
}
