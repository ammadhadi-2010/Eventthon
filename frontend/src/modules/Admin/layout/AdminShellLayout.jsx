import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { sidebarItems } from '../data/adminConfig';
import { isAdminPreviewPath } from './adminPreviewPaths';
import { isAdminFullBleedPath } from './adminWorkspacePaths';
import { useAdminSidebar } from './AdminSidebarContext';
import '../styles/admin-preview.css';
import AdminSidebar from './AdminSidebar';
import '../styles/AdminShell.css';

export default function AdminShellLayout() {
  const { pathname } = useLocation();
  const { open, close } = useAdminSidebar();
  const fullBleed = isAdminFullBleedPath(pathname);
  const previewMode = isAdminPreviewPath(pathname);
  const hideSidebar = fullBleed || previewMode;

  return (
    <div className={`admin-dashboard${hideSidebar ? ' admin-dashboard--full-bleed' : ''}`}>
      {!hideSidebar && open ? (
        <button
          type="button"
          className="admin-sidebar-backdrop lg:hidden"
          aria-label="Close admin menu"
          onClick={close}
        />
      ) : null}
      <div className={`admin-dashboard__grid${hideSidebar ? ' admin-dashboard__grid--full-bleed' : ''}`}>
        {hideSidebar ? null : (
          <AdminSidebar items={sidebarItems} drawerOpen={open} onNavigate={close} />
        )}
        <main
          className={
            fullBleed
              ? 'admin-main admin-main--compact admin-main--full-bleed w-full flex-1 min-w-0 overflow-y-auto block p-3 py-2 lg:p-3 lg:pr-5 lg:py-5'
              : previewMode
                ? 'admin-main admin-main--compact admin-main--preview w-full flex-1 min-w-0 overflow-y-auto block p-3 py-2 lg:p-3 lg:pr-5 lg:py-5'
                : 'admin-main admin-main--compact w-full flex-1 min-w-0 overflow-y-auto block p-3 py-2 lg:p-3 lg:pr-5 lg:py-5'
          }
        >
          <div className="w-full min-w-0 block">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
