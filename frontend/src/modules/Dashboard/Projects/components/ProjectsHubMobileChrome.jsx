import React, { useCallback, useEffect, useState } from 'react';
import { subscribeHubDrawerToggle } from '../../Navbar/hubDrawerBus';

export function getProjectsPageShellClasses({ isCreate, isOverview, isMobile, isMobileTopCollab, hideRightRail }) {
  const layoutClass = [
    'ph-layout',
    isCreate ? 'ph-layout--create' : '',
    hideRightRail ? 'ph-layout--no-right' : '',
    isOverview || isMobileTopCollab ? 'ph-mobile-shell__body' : '',
    isCreate && isMobile ? 'ph-mobile-shell__body ph-mobile-shell__body--create' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const pageShellClass = [
    'ph-page',
    isOverview || isMobileTopCollab ? 'ph-mobile-shell hub-inner-mobile-shell' : '',
    isMobileTopCollab ? 'ph-mobile-shell--subpage' : '',
    isCreate && isMobile ? 'ph-mobile-shell ph-mobile-shell--create hub-inner-mobile-shell' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return { layoutClass, pageShellClass };
}

export function useProjectsMobileDrawer() {
  const [open, setOpen] = useState(false);
  useEffect(() => subscribeHubDrawerToggle('projects', () => setOpen(true)), []);
  const close = useCallback(() => setOpen(false), []);
  const runAndClose = useCallback((fn) => (...args) => {
    fn(...args);
    close();
  }, [close]);
  return { open, close, runAndClose };
}

export function ProjectsMobileDrawerBackdrop({ open, onClose }) {
  if (!open) return null;
  return (
    <button
      type="button"
      className="ph-hub-drawer-backdrop is-visible"
      aria-label="Close projects menu"
      onClick={onClose}
    />
  );
}

export default function ProjectsHubMobileChrome() {
  return null;
}
