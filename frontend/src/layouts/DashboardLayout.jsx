import React, { useState, useEffect, useMemo } from 'react';
import DashboardNavSwitcher from '../modules/Dashboard/Navbar/DashboardNavSwitcher';
import { CompanyMobileChromeProvider } from '../components/views/company/context/CompanyMobileChromeContext';
import { CompanyWorkspaceProvider } from '../components/views/company/context/CompanyWorkspaceContext';
import { isAdminControlPath, isAdminFullBleedPath } from '../modules/Admin/layout/adminWorkspacePaths';
import { isAdminPreviewPath } from '../modules/Admin/layout/adminPreviewPaths';
import AdminMobileBottomNav from '../modules/Admin/layout/AdminMobileBottomNav';
import { AdminSidebarProvider } from '../modules/Admin/layout/AdminSidebarContext';
import useScrollHideNavbar, {
  resetScrollHideNavbar,
  refreshScrollHideRoots,
} from '../modules/Admin/hooks/useScrollHideNavbar';
import { isCompanyWorkspacePath } from '../modules/Dashboard/Navbar/companyWorkspacePaths';
import { readCompanyHubAccess } from '../modules/Dashboard/Navbar/useCompanyHubAccess';
import { prefetchCompanyPortalDashboard } from '../components/views/company/services/prefetchCompanyPortalDashboard';
import { useLocation } from 'react-router-dom';
import Footer from '../components/Footer';
import { hasStoredSession, readStoredUserStub } from '../utils/storedUser';
import useTelemetry from '../hooks/useTelemetry';
import FloatingActionStack from '../components/FloatingActionStack';
import DashboardMobileBottomNav from '../modules/Dashboard/components/mobile/DashboardMobileBottomNav';
import MemberMobileNavDrawer from '../modules/Dashboard/components/mobile/MemberMobileNavDrawer';
import MobileUserMenuOverlay from '../modules/Dashboard/Navbar/MobileUserMenuOverlay';
import { DashboardShellContext } from '../modules/Dashboard/context/dashboardShellContext';
import '../BackgroundCanvas.css';
import './dashboard-shell.css';
import '../modules/Dashboard/Navbar/unified-global-nav-hubs.css';
import '../modules/Dashboard/Navbar/hub-inner-mobile-padding.css';

const DashboardLayout = ({ children, userData, refreshData }) => {
  const location = useLocation();
  const adminHub = isAdminControlPath(location.pathname);
  const { hidden: navHidden } = useScrollHideNavbar(true);
  const companyHub = !adminHub && isCompanyWorkspacePath(location.pathname);
  const [mobileLeftDrawerOpen, setMobileLeftDrawerOpen] = useState(false);
  const [mobileUserMenuOpen, setMobileUserMenuOpen] = useState(false);
  const storedUser = useMemo(() => readStoredUserStub(), []);
  const effectiveUser = userData || storedUser;
  const employerWorkspace = !adminHub && readCompanyHubAccess(effectiveUser);

  useEffect(() => {
    if (adminHub || !employerWorkspace) return undefined;
    prefetchCompanyPortalDashboard();
    return undefined;
  }, [adminHub, employerWorkspace, effectiveUser?.role, effectiveUser?.company_id, effectiveUser?.companyId]);

  const isAuthenticated = Boolean(effectiveUser) || hasStoredSession();
  const telemetryEnabled = isAuthenticated && !adminHub;
  useTelemetry(effectiveUser, telemetryEnabled);

  useEffect(() => {
    setMobileLeftDrawerOpen(false);
    setMobileUserMenuOpen(false);
    resetScrollHideNavbar();
    refreshScrollHideRoots();
    const timer = window.setTimeout(refreshScrollHideRoots, 350);
    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  const shellContextValue = useMemo(
    () => ({
      mobileLeftDrawerOpen,
      setMobileLeftDrawerOpen,
      toggleMobileLeftDrawer: () => setMobileLeftDrawerOpen((open) => !open),
      mobileUserMenuOpen,
      setMobileUserMenuOpen,
      toggleMobileUserMenu: () => setMobileUserMenuOpen((open) => !open),
    }),
    [mobileLeftDrawerOpen, mobileUserMenuOpen],
  );

  const showMobileBottomNav = !adminHub && !companyHub;
  const showAdminMobileBottomNav = adminHub && !isAdminFullBleedPath(location.pathname);
  const adminPreview = adminHub && isAdminPreviewPath(location.pathname);
  const hubMobilePad = showMobileBottomNav || showAdminMobileBottomNav;
  const showMemberNavDrawer =
    showMobileBottomNav && location.pathname.startsWith('/messages');

  const shell = (
    <DashboardShellContext.Provider value={shellContextValue}>
    <div className={`et-app-shell${navHidden ? ' et-app-shell--nav-hidden' : ''}`}>
      <div className="et-mesh-bg" aria-hidden />
      <div className="et-glow-spot" aria-hidden />

      <header className={`et-top-nav${navHidden ? ' et-top-nav--scroll-hidden' : ''}`}>
        <DashboardNavSwitcher user={effectiveUser} />
      </header>

      <main className="center-content-scroll et-main-scroll">
        <div className={`et-main-inner et-hub-pin-wrap${adminHub ? ' et-main-inner--admin' : ''}${adminPreview ? ' et-main-inner--admin-preview' : ''}${hubMobilePad ? ' et-main-inner--hub-mobile-pad' : ''}${showMobileBottomNav ? ' et-main-inner--mobile-nav-pad' : ''}${showAdminMobileBottomNav ? ' et-main-inner--admin-mobile-pad' : ''}`}>
          {children}
        </div>
        {adminHub ? null : <Footer />}
      </main>

      <FloatingActionStack userData={effectiveUser} />
      {showMobileBottomNav ? <DashboardMobileBottomNav /> : null}
      {showAdminMobileBottomNav ? <AdminMobileBottomNav /> : null}
      {showMemberNavDrawer ? <MemberMobileNavDrawer /> : null}

      <MobileUserMenuOverlay
        open={mobileUserMenuOpen}
        user={effectiveUser}
        onClose={() => setMobileUserMenuOpen(false)}
      />
    </div>
    </DashboardShellContext.Provider>
  );

  const withCompany = (node) => (
    <CompanyWorkspaceProvider>
      <CompanyMobileChromeProvider>{node}</CompanyMobileChromeProvider>
    </CompanyWorkspaceProvider>
  );

  if (employerWorkspace) {
    return withCompany(adminHub ? <AdminSidebarProvider>{shell}</AdminSidebarProvider> : shell);
  }
  return adminHub ? <AdminSidebarProvider>{shell}</AdminSidebarProvider> : shell;
};

export default DashboardLayout;
