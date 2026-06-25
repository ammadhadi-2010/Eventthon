import React, { useState, useEffect, useCallback, useMemo } from 'react';
import DashboardNavSwitcher from '../modules/Dashboard/Navbar/DashboardNavSwitcher';
import { CompanyWorkspaceProvider } from '../components/views/company/context/CompanyWorkspaceContext';
import { isAdminControlPath } from '../modules/Admin/layout/adminWorkspacePaths';
import { isAdminPreviewPath } from '../modules/Admin/layout/adminPreviewPaths';
import AdminMobileBottomNav from '../modules/Admin/layout/AdminMobileBottomNav';
import { AdminSidebarProvider } from '../modules/Admin/layout/AdminSidebarContext';
import useScrollHideNavbar from '../modules/Admin/hooks/useScrollHideNavbar';
import { isCompanyWorkspacePath } from '../modules/Dashboard/Navbar/companyWorkspacePaths';
import { readCompanyHubAccess } from '../modules/Dashboard/Navbar/useCompanyHubAccess';
import { useLocation } from 'react-router-dom';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { fetchAlertsBundle } from '../modules/Dashboard/Alerts/services/alertsApi';
import { fetchEmployerAlertsBundle } from '../modules/Dashboard/Alerts/services/employerAlertsApi';
import { hasStoredSession, readStoredUserStub } from '../utils/storedUser';
import useTelemetry from '../hooks/useTelemetry';
import FloatingActionStack from '../components/FloatingActionStack';
import DashboardMobileBottomNav from '../modules/Dashboard/components/mobile/DashboardMobileBottomNav';
import MobileUserMenuOverlay from '../modules/Dashboard/Navbar/MobileUserMenuOverlay';
import { DashboardShellContext } from '../modules/Dashboard/context/dashboardShellContext';
import '../BackgroundCanvas.css';
import './dashboard-shell.css';

const DashboardLayout = ({ children, userData, refreshData }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const adminHub = isAdminControlPath(location.pathname);
  const { hidden: navHidden } = useScrollHideNavbar(true);
  const companyHub = !adminHub && isCompanyWorkspacePath(location.pathname);
  const employerWorkspace = !adminHub && readCompanyHubAccess();
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [mobileLeftDrawerOpen, setMobileLeftDrawerOpen] = useState(false);
  const [mobileUserMenuOpen, setMobileUserMenuOpen] = useState(false);
  const storedUser = useMemo(() => readStoredUserStub(), []);
  const effectiveUser = userData || storedUser;

  const refreshAlertCount = useCallback(async () => {
    if (adminHub || !effectiveUser) {
      setNotifCount(0);
      return;
    }
    try {
      const bundle = companyHub
        ? await fetchEmployerAlertsBundle(effectiveUser)
        : await fetchAlertsBundle(effectiveUser);
      setNotifCount(bundle?.stats?.unread ?? 0);
    } catch {
      setNotifCount(0);
    }
  }, [effectiveUser, companyHub, adminHub]);

  useEffect(() => {
    if (adminHub || !effectiveUser) return undefined;
    const timer = window.setTimeout(() => {
      refreshAlertCount();
    }, 400);
    const onAlertsChanged = () => refreshAlertCount();
    window.addEventListener('et:alerts-changed', onAlertsChanged);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('et:alerts-changed', onAlertsChanged);
    };
  }, [refreshAlertCount, adminHub, effectiveUser]);

  const isAuthenticated = Boolean(effectiveUser) || hasStoredSession();
  const telemetryEnabled = isAuthenticated && !adminHub;
  useTelemetry(effectiveUser, telemetryEnabled);

  useEffect(() => {
    setMobileLeftDrawerOpen(false);
    setMobileUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    let timer;
    if (!isAuthenticated && !showLoginPopup) {
      timer = setTimeout(() => setShowLoginPopup(true), 180000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isAuthenticated, showLoginPopup]);

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
  const showAdminMobileBottomNav = adminHub && !isAdminPreviewPath(location.pathname);

  const shell = (
    <DashboardShellContext.Provider value={shellContextValue}>
    <div className="et-app-shell">
      <div className="et-mesh-bg" aria-hidden />
      <div className="et-glow-spot" aria-hidden />

      <header className={`et-top-nav${navHidden ? ' et-top-nav--scroll-hidden' : ''}`}>
        <DashboardNavSwitcher user={effectiveUser} notifCount={notifCount} />
      </header>

      <main className="center-content-scroll et-main-scroll">
        <div className={`et-main-inner et-hub-pin-wrap${adminHub ? ' et-main-inner--admin' : ''}${showMobileBottomNav ? ' et-main-inner--mobile-nav-pad' : ''}${showAdminMobileBottomNav ? ' et-main-inner--admin-mobile-pad' : ''}`}>
          {children}
        </div>
        {adminHub ? null : <Footer />}
      </main>

      <FloatingActionStack userData={effectiveUser} />
      {showMobileBottomNav ? <DashboardMobileBottomNav /> : null}
      {showAdminMobileBottomNav ? <AdminMobileBottomNav hidden={navHidden} /> : null}

      <MobileUserMenuOverlay
        open={mobileUserMenuOpen}
        user={effectiveUser}
        onClose={() => setMobileUserMenuOpen(false)}
      />

      {showLoginPopup ? (
        <div className="et-guest-popup-overlay" role="dialog" aria-modal="true">
          <div className="et-guest-popup">
            <div className="et-guest-popup__icon" aria-hidden>
              ✨
            </div>
            <h2>Join the Elite Network</h2>
            <p>
              Enjoying the feed? Log in to start posting, build your squad, and unlock rewards.
            </p>
            <div className="et-guest-popup__actions">
              <button
                type="button"
                className="et-guest-popup__primary hover-scale"
                onClick={() => {
                  setShowLoginPopup(false);
                  navigate('/auth/login');
                }}
              >
                Get Started
              </button>
              <button
                type="button"
                className="et-guest-popup__secondary"
                onClick={() => setShowLoginPopup(false)}
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
    </DashboardShellContext.Provider>
  );

  return employerWorkspace ? (
    <CompanyWorkspaceProvider>{adminHub ? <AdminSidebarProvider>{shell}</AdminSidebarProvider> : shell}</CompanyWorkspaceProvider>
  ) : (
    adminHub ? <AdminSidebarProvider>{shell}</AdminSidebarProvider> : shell
  );
};

export default DashboardLayout;
