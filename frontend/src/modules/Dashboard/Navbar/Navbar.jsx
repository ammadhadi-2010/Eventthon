import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { navStyles } from './NavStyles';
import EventThonLogo from '../../../components/brand/EventThonLogo';
import { FiSearch, FiHome, FiUsers, FiBriefcase, FiBell, FiCreditCard, FiMessageSquare } from 'react-icons/fi';
import UserMenu from './UserMenu.jsx';
import MobileUserMenuOverlay from './MobileUserMenuOverlay';
import CompanyHubSwitch from './CompanyHubSwitch.jsx';
import AdminHubSwitch from './AdminHubSwitch.jsx';
import { getAvatarUrl, getDisplayName } from './userMenuUtils';
import { isAdminContextPath, resolveMonitorTabPath, ADMIN_MONITOR_SECTIONS } from '../../Admin/layout/adminPreviewPaths';
import useNavbarMobile from './useNavbarMobile';
import './hub-switch.css';
import './navbar-mobile.css';

const NAV_ICON_MAP = {
  Home: FiHome,
  Squads: FiUsers,
  Projects: FiBriefcase,
  Gigs: FiBriefcase,
  Jobs: FiBriefcase,
};

const Navbar = ({ user, notifCount = 0 }) => {
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
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
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

  return (
    <nav style={navStyles.container} className="dash-nav">
      <div style={navStyles.sectionLeft}>
        <div
          style={navStyles.logo}
          onClick={() => navigate(inAdminContext ? '/admin-control' : '/dashboard')}
        >
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
          return (
            <div key={item.name} onClick={() => navigate(item.path)} style={navStyles.navItem(isActive)}>
              <div style={{ color: isActive ? '#3b82f6' : '#94a3b8' }}>{item.icon}</div>
              <span style={{ fontSize: '11px', fontWeight: '700', marginTop: '6px' }}>{item.name}</span>
              {isActive ? <div style={navStyles.activeGlowLine} /> : null}
            </div>
          );
        })}
      </div>

      <div style={navStyles.sectionRight} className="dash-nav-section-right" ref={menuRef}>
        <div className="dash-nav-desktop-only" style={navStyles.rightSideIcon} onClick={() => navigate('/messages')}>
          <FiMessageSquare size={18} />
        </div>
        <div style={navStyles.rightSideIcon} onClick={() => navigate('/notifications/alerts')}>
          <FiBell size={18} />
          {notifCount > 0 ? <span style={navStyles.neonBadge}>{notifCount}</span> : null}
        </div>
        <div className="dash-nav-desktop-only" style={navStyles.rightSideIcon} onClick={() => navigate('/wallet')} title="Wallet — Coming Soon">
          <FiCreditCard size={18} />
        </div>

        <div className="dash-nav-desktop-only dash-nav-hub-switches">
          <AdminHubSwitch user={user} />
          <CompanyHubSwitch />
        </div>

        <div className="dash-nav-mobile-only dash-nav-hub-switches">
          <AdminHubSwitch user={user} />
          <CompanyHubSwitch />
        </div>

        <div
          style={navStyles.profileBox}
          onClick={() => handleAvatarClick(isMenuOpen, setIsMenuOpen)}
        >
          <div style={navStyles.avatarWrapper}>
            <img
              src={avatarSrc}
              alt=""
              style={navStyles.avatarImg}
              onError={() => setAvatarSrc(getAvatarUrl(null))}
            />
            <span style={navStyles.onlineStatus} aria-hidden />
          </div>
          <span style={navStyles.profileName} className="dash-nav-profile-name">
            {getDisplayName(user)} ▾
          </span>
          {isMenuOpen && !isMobileNav ? (
            <UserMenu user={user} onClose={() => setIsMenuOpen(false)} />
          ) : null}
        </div>
      </div>

      <MobileUserMenuOverlay
        open={isMobileNav && isMenuOpen}
        user={user}
        onClose={() => setIsMenuOpen(false)}
      />

      <div
        className={`dash-nav-search-panel${searchOpen ? ' dash-nav-search-panel--open' : ''}`}
        role="search"
      >
        <FiSearch className="dash-nav-search-panel__icon" aria-hidden />
        <input type="text" placeholder="Search people, squads..." aria-label="Mobile search" />
      </div>
    </nav>
  );
};

export default Navbar;
