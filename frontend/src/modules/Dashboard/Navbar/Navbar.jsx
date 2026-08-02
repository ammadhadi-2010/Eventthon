import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { navStyles } from './NavStyles';
import EventThonLogo from '../../../components/brand/EventThonLogo';
import { FiSearch, FiHome, FiUsers, FiBriefcase, FiBell, FiCreditCard, FiLayers, FiMessageSquare } from 'react-icons/fi';
import UserMenu from './UserMenu.jsx';
import MobileUserMenuOverlay from './MobileUserMenuOverlay';
import CompanyHubSwitch from './CompanyHubSwitch.jsx';
import HubUserAdminSwitch from './HubUserAdminSwitch';
import MemberNavbarMobile from './MemberNavbarMobile';
import { getAvatarUrl, getDisplayName } from './userMenuUtils';
import { isAdminContextPath, resolveMonitorTabPath, ADMIN_MONITOR_SECTIONS } from '../../Admin/layout/adminPreviewPaths';
import useNavbarMobile from './useNavbarMobile';
import './hub-switch.css';
import './navbar-mobile.css';
import './member-navbar-mobile.css';
import '../../Admin/layout/styles/admin-mobile-header.css';

const NAV_ICON_COLORS = {
  Home: '#7dd3fc',
  Squads: '#c4b5fd',
  Projects: '#6ee7b7',
  Gigs: '#fbbf24',
  Jobs: '#f9a8d4',
  Alerts: '#fca5a5',
};

const NAV_ICON_MAP = {
  Home: FiHome,
  Squads: FiUsers,
  Projects: FiBriefcase,
  Gigs: FiLayers,
  Jobs: FiBriefcase,
};

const Navbar = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState(() => getAvatarUrl(user));
  const menuRef = useRef(null);
  const { isMobileNav, searchOpen, setSearchOpen, handleAvatarClick } = useNavbarMobile();

  useEffect(() => {
    setAvatarSrc(getAvatarUrl(user));
  }, [user?.profile_image_url, user?.avatar, user?.profile_image, user?.imageurl, user?.name, user?.email]);

  useEffect(() => {
    if (!isMenuOpen) return undefined;
    const onDocClick = (event) => {
      const target = event.target;
      // Mobile menu is portaled to document.body — do not treat it as "outside"
      if (target?.closest?.('.et-user-menu-mobile-panel, .et-user-menu, .et-user-menu-mobile-overlay')) {
        return;
      }
      if (menuRef.current && !menuRef.current.contains(target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('touchstart', onDocClick, { passive: true });
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('touchstart', onDocClick);
    };
  }, [isMenuOpen]);

  const inAdminContext = isAdminContextPath(location.pathname);
  const navItems = [
    ...ADMIN_MONITOR_SECTIONS.map((tab) => {
      const Icon = NAV_ICON_MAP[tab.name] || FiBriefcase;
      return {
        name: tab.name,
        icon: <Icon size={22} />,
        path: resolveMonitorTabPath(tab, location.pathname),
      };
    }),
    { name: 'Alerts', icon: <FiBell size={22} />, path: '/notifications/alerts' },
  ];

  const actionProps = {
    menuRef,
    user: { ...user, avatar: avatarSrc },
    profileOpen: isMenuOpen,
    onToggleProfile: () => handleAvatarClick(isMenuOpen, setIsMenuOpen),
    onCloseProfile: () => setIsMenuOpen(false),
    onChat: () => navigate('/messages'),
  };

  return (
    <nav style={navStyles.container} className="dash-nav">
      <MemberNavbarMobile user={user} actionProps={actionProps} />

      <div className="dash-nav__desktop">
        <div style={navStyles.sectionLeft}>
          <div style={navStyles.logo} onClick={() => navigate(inAdminContext ? '/admin-control' : '/dashboard')}>
            <EventThonLogo variant="header" style={{ position: 'relative', zIndex: 1 }} />
            <div style={navStyles.logoGlow} />
          </div>
          <button
            type="button"
            className="dash-nav-search-toggle"
            onClick={() => setSearchOpen((open) => !open)}
            aria-label="Toggle search"
            aria-expanded={searchOpen}
          >
            <FiSearch size={18} />
          </button>
          <div style={navStyles.searchWrapper} className="dash-nav-search-desktop">
            <FiSearch style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input type="text" placeholder="Search people, squads..." style={navStyles.searchInput} />
          </div>
        </div>

        <div style={navStyles.sectionCenter} className="dash-nav-center-links">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const tone = NAV_ICON_COLORS[item.name] || '#94a3b8';
            return (
              <div key={item.name} onClick={() => navigate(item.path)} style={navStyles.navItem(isActive)}>
                <div style={{ color: isActive ? '#38bdf8' : tone }}>{item.icon}</div>
                <span style={{ fontSize: '11px', fontWeight: '700', marginTop: '6px', color: isActive ? '#38bdf8' : tone }}>
                  {item.name}
                </span>
                {isActive ? <div style={navStyles.activeGlowLine} /> : null}
              </div>
            );
          })}
        </div>

        <div style={navStyles.sectionRight} className="dash-nav-section-right" ref={menuRef}>
          <div className="dash-nav-desktop-only" style={navStyles.rightSideIcon} onClick={() => navigate('/messages')}>
            <FiMessageSquare size={18} />
          </div>
          <div className="dash-nav-desktop-only" style={navStyles.rightSideIcon} onClick={() => navigate('/wallet')} title="My Wallet">
            <FiCreditCard size={18} />
          </div>
          <div className="dash-nav-desktop-only dash-nav-hub-switches">
            <HubUserAdminSwitch />
            <CompanyHubSwitch user={user} />
          </div>
          <div
            style={navStyles.profileBox}
            onClick={() => handleAvatarClick(isMenuOpen, setIsMenuOpen)}
          >
            <div style={navStyles.avatarWrapper}>
              <img src={avatarSrc} alt="" style={navStyles.avatarImg} onError={() => setAvatarSrc(getAvatarUrl(null))} />
              <span style={navStyles.onlineStatus} aria-hidden />
            </div>
            <span style={navStyles.profileName} className="dash-nav-profile-name">
              {getDisplayName(user)} ▾
            </span>
            {isMenuOpen ? <UserMenu user={user} onClose={() => setIsMenuOpen(false)} /> : null}
          </div>
        </div>
      </div>

      <MobileUserMenuOverlay open={isMobileNav && isMenuOpen} user={user} onClose={() => setIsMenuOpen(false)} />

      <div className={`dash-nav-search-panel${searchOpen ? ' dash-nav-search-panel--open' : ''}`} role="search">
        <FiSearch className="dash-nav-search-panel__icon" aria-hidden />
        <input type="text" placeholder="Search people, squads..." aria-label="Mobile search" />
      </div>
    </nav>
  );
};

export default Navbar;
