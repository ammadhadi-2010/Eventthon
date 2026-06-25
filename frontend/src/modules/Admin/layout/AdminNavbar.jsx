import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import EventThonLogo from '../../../components/brand/EventThonLogo';
import SwitchToAdminButton from '../../../modules/Dashboard/Navbar/SwitchToAdminButton';
import { shouldShowSwitchToAdmin } from '../../../modules/Dashboard/Navbar/useAdminHubAccess';
import useAdminNotifCount from '../hooks/useAdminNotifCount';
import AdminMonitorTabs from './AdminMonitorTabs';
import AdminNavDropdown from './AdminNavDropdown';
import AdminNavbarActions from './AdminNavbarActions';
import AdminNavbarMobile from './AdminNavbarMobile';
import AdminNavbarSearch from './AdminNavbarSearch';
import { isAdminPreviewPath } from './adminPreviewPaths';
import { ADMIN_DASHBOARD_ALIAS } from './adminWorkspacePaths';
import { adminNavbarShellStyle } from './adminNavbarShellStyle';
import '../../../modules/Dashboard/Navbar/hub-switch.css';
import './admin-global-navbar.css';

function isAdministratorSession() {
  return localStorage.getItem('userRole') === 'admin';
}

export default function AdminNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef(null);
  const profileRef = useRef(null);
  const [navMenuOpen, setNavMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifCount = useAdminNotifCount();

  useEffect(() => {
    setNavMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!navMenuOpen && !profileOpen) return undefined;
    const close = (e) => {
      if (navRef.current?.contains(e.target) || profileRef.current?.contains(e.target)) return;
      setNavMenuOpen(false);
      setProfileOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [navMenuOpen, profileOpen]);

  const chatActive = location.pathname.startsWith('/admin-control/chat');
  const notifActive = location.pathname.startsWith('/admin-control/notifications');
  const showSwitchToAdmin = shouldShowSwitchToAdmin(location.pathname);
  const inHubPreview = isAdminPreviewPath(location.pathname);
  const showUtilities = !inHubPreview;

  const toggleNavMenu = () => {
    setProfileOpen(false);
    setNavMenuOpen((open) => !open);
  };

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
    onToggleProfile: () => {
      setNavMenuOpen(false);
      setProfileOpen((open) => !open);
    },
    onCloseProfile: () => setProfileOpen(false),
    chatActive,
    notifActive,
    notifCount,
    onChat: () => navigate('/admin-control/chat'),
    onNotif: () => navigate('/admin-control/notifications'),
    showUtilities,
    hubSwitch: showSwitchToAdmin ? <SwitchToAdminButton className="agn-navbar__hub-switch" /> : null,
  };

  const mobileBrand = !inHubPreview ? (
    <div className="agn-navbar__brand-wrap" ref={navRef}>
      <button
        type="button"
        className="agn-navbar__menu-btn"
        onClick={toggleNavMenu}
        aria-expanded={navMenuOpen}
        aria-label="Open admin navigation menu"
      >
        <Menu size={20} strokeWidth={2.2} aria-hidden />
      </button>
      <button
        type="button"
        className="agn-navbar__logo-link"
        onClick={toggleNavMenu}
        aria-expanded={navMenuOpen}
        aria-label="Toggle admin navigation menu"
      >
        <EventThonLogo variant="header" className="agn-navbar__logo-img agn-navbar__logo-img--compact" />
      </button>
      <AdminNavDropdown open={navMenuOpen} onClose={() => setNavMenuOpen(false)} />
    </div>
  ) : (
    <button type="button" className="agn-navbar__logo-link" onClick={handleLogoClick} aria-label="Go to admin dashboard">
      <EventThonLogo variant="header" className="agn-navbar__logo-img agn-navbar__logo-img--compact" />
    </button>
  );

  return (
    <header className="agn-navbar" style={adminNavbarShellStyle} aria-label="Admin header">
      <AdminNavbarMobile brandSlot={mobileBrand} actionProps={actionProps} />

      <div className="agn-navbar__desktop hidden lg:grid">
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
