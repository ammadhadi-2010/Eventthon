import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import EventThonLogo from '../../../components/brand/EventThonLogo';
import HubUserAdminSwitch from '../../../modules/Dashboard/Navbar/HubUserAdminSwitch';
import HubPageDrawerTrigger from '../../../modules/Dashboard/Navbar/HubPageDrawerTrigger';
import useAdminNotifCount from '../hooks/useAdminNotifCount';
import AdminMonitorTabs from './AdminMonitorTabs';
import AdminNavbarActions from './AdminNavbarActions';
import AdminNavbarMobile from './AdminNavbarMobile';
import AdminNavbarSearch from './AdminNavbarSearch';
import { useAdminSidebar } from './AdminSidebarContext';
import { ADMIN_DASHBOARD_ALIAS } from './adminWorkspacePaths';
import { adminNavbarShellStyle } from './adminNavbarShellStyle';
import '../../../modules/Dashboard/Navbar/hub-switch.css';
import './admin-global-navbar.css';
import './styles/admin-mobile-header.css';

function isAdministratorSession() {
  return localStorage.getItem('userRole') === 'admin';
}

export default function AdminNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const profileRef = useRef(null);
  const { toggle: toggleSidebar } = useAdminSidebar();
  const [profileOpen, setProfileOpen] = useState(false);
  const notifCount = useAdminNotifCount();

  useEffect(() => {
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!profileOpen) return undefined;
    const close = (event) => {
      if (profileRef.current?.contains(event.target)) return;
      setProfileOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [profileOpen]);

  const chatActive = location.pathname.startsWith('/admin-control/chat');
  const notifActive = location.pathname.startsWith('/admin-control/notifications');
  const showAdminHubSwitch = isAdministratorSession();
  const showUtilities = true;

  const handleLogoClick = () => {
    if (isAdministratorSession()) {
      navigate(ADMIN_DASHBOARD_ALIAS);
      return;
    }
    navigate('/dashboard');
  };

  const actionProps = {
    menuRef: profileRef,
    profileOpen,
    onToggleProfile: () => setProfileOpen((open) => !open),
    onCloseProfile: () => setProfileOpen(false),
    chatActive,
    notifActive,
    notifCount,
    onChat: () => navigate('/admin-control/chat'),
    onNotif: () => navigate('/admin-control/notifications'),
    showUtilities,
    hubSwitch: showAdminHubSwitch ? <HubUserAdminSwitch className="agn-navbar__hub-switch" /> : null,
  };

  const handleMobileLogoClick = () => {
    toggleSidebar();
  };

  const mobileBrand = (
    <button
      type="button"
      className="agn-navbar__logo-link"
      onClick={handleMobileLogoClick}
      aria-label="Open admin sidebar menu"
    >
      <EventThonLogo variant="header" className="agn-navbar__logo-img agn-navbar__logo-img--compact" />
    </button>
  );

  return (
    <header className="agn-navbar" style={adminNavbarShellStyle} aria-label="Admin header">
      <AdminNavbarMobile
        brandSlot={mobileBrand}
        hubDrawerTrigger={<HubPageDrawerTrigger className="agn-navbar__hub-drawer-trigger" />}
        actionProps={actionProps}
      />

      <div className="agn-navbar__desktop">
        <section className="agn-navbar__left" aria-label="Admin brand and search">
          <button type="button" className="agn-navbar__logo-link" onClick={handleLogoClick} aria-label="Go to admin dashboard">
            <EventThonLogo variant="header" className="agn-navbar__logo-img" />
          </button>
          <AdminNavbarSearch />
        </section>
        <section className="agn-navbar__center" aria-label="User monitoring hub">
          <AdminMonitorTabs />
        </section>
        <AdminNavbarActions {...actionProps} />
      </div>
    </header>
  );
}
