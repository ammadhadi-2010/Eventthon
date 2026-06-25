import React from 'react';
import { createPortal } from 'react-dom';
import CompanyPortalSidebar from '../../layout/CompanyPortalSidebar';

export default function CompanyMobileSidebarDrawer({ open, onClose }) {
  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <>
      <button
        type="button"
        className="cp-mobile-sidebar-backdrop"
        onClick={onClose}
        aria-label="Close company menu"
      />
      <div className="cp-mobile-sidebar-drawer" role="dialog" aria-label="Company navigation">
        <CompanyPortalSidebar />
      </div>
    </>,
    document.body,
  );
}
