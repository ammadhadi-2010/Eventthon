import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useMobileHub } from '../../../../hooks/useMobileHub';
import { isCompanyCommsFullBleedPath } from '../../../../modules/Dashboard/Navbar/companyWorkspacePaths';
import CompanyMobileBottomNav from '../components/mobile/CompanyMobileBottomNav';
import CompanyMobileSidebarDrawer from '../components/mobile/CompanyMobileSidebarDrawer';
import CompanyMobileTopBar from '../components/mobile/CompanyMobileTopBar';
import useScrollHideNavbar, {
  resetScrollHideNavbar,
} from '../../../../modules/Admin/hooks/useScrollHideNavbar';
import CompanyPortalSidebar from './CompanyPortalSidebar';
import '../styles/companyPortal.css';
import '../styles/company-desktop-layout.css';
import '../styles/company-mobile-shell.css';
import '../styles/company-mobile-drawer.css';
import '../styles/company-mobile-stats-strip.css';

export default function CompanyPortalLayout() {
  const { pathname } = useLocation();
  const isMobile = useMobileHub();
  const hidePanelSidebar = isCompanyCommsFullBleedPath(pathname);
  const useMobileChrome = isMobile;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { hidden: chromeHidden } = useScrollHideNavbar(true);
  const chromeVisible = !chromeHidden;

  useEffect(() => {
    const root = document.querySelector('main.et-main-scroll');
    if (root) root.scrollTop = 0;
    resetScrollHideNavbar();
    setIsSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!useMobileChrome || !isSidebarOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [useMobileChrome, isSidebarOpen]);

  return (
    <div
      className={`cp-shell${hidePanelSidebar ? ' cp-shell--comms-full' : ''}${
        useMobileChrome ? ' cp-mobile-shell' : ''
      }`}
    >
      {useMobileChrome ? (
        <CompanyMobileTopBar
          isVisible={chromeVisible}
          isSidebarOpen={isSidebarOpen}
          onSidebarToggle={() => setIsSidebarOpen((open) => !open)}
        />
      ) : null}
      {useMobileChrome && isSidebarOpen && !hidePanelSidebar ? (
        <CompanyMobileSidebarDrawer open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      ) : null}
      {!useMobileChrome && !hidePanelSidebar ? <CompanyPortalSidebar /> : null}
      <main
        className={`cp-main${hidePanelSidebar ? ' cp-main--comms-full' : ''}${
          useMobileChrome ? ' cp-main--mobile-chrome' : ''
        }`}
      >
        <Outlet />
      </main>
      {useMobileChrome ? <CompanyMobileBottomNav isVisible={chromeVisible} /> : null}
    </div>
  );
}
