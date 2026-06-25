import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiBell, FiMessageSquare, FiSearch } from 'react-icons/fi';
import { navStyles } from './NavStyles';
import { useCompanyWorkspace } from '../../../components/views/company/context/CompanyWorkspaceContext';
import { resolvePortalImageurl } from '../../../components/views/company/utils/portalImage';
import CompanyNavMenu from './CompanyNavMenu';
import SwitchToAdminButton from './SwitchToAdminButton';
import { shouldShowSwitchToAdmin } from './useAdminHubAccess';
import './hub-switch.css';
import './company-navbar.css';

const ADMIN_COMPANIES_PATH = '/admin-control/companies';

export default function CompanyNavbar({ user, notifCount = 0 }) {
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const workspace = useCompanyWorkspace();
  const data = workspace?.data;
  const company = data?.company || null;

  const [logoSrc, setLogoSrc] = useState(() =>
    resolvePortalImageurl(company?.imageurl, company?.name),
  );

  useEffect(() => {
    setLogoSrc(resolvePortalImageurl(company?.imageurl, company?.name));
  }, [company?.imageurl, company?.name]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);

  return (
    <nav className="cn-navbar" style={navStyles.container}>
      <div className="cn-navbar__left">
        <button type="button" className="cn-navbar__brand" onClick={() => navigate('/company/dashboard')}>
          <span className="cn-navbar__logo-mark">ET</span>
          <span className="cn-navbar__hub-tag">Company Hub</span>
        </button>
      </div>

      <div className="cn-navbar__center">
        <div className="cn-navbar__search">
          <FiSearch className="cn-navbar__search-icon" aria-hidden />
          <input
            type="search"
            className="cn-navbar__search-input"
            placeholder="Search jobs, applicants, and company workspace…"
            aria-label="Search company workspace"
          />
        </div>
      </div>

      <div className="cn-navbar__right" ref={menuRef}>
        {shouldShowSwitchToAdmin(location.pathname, user) ? (
          <SwitchToAdminButton to={ADMIN_COMPANIES_PATH} className="cn-navbar__hub-switch" />
        ) : null}
        <button
          type="button"
          className="cn-navbar__icon-btn"
          style={navStyles.rightSideIcon}
          onClick={() => navigate('/company/notifications')}
          aria-label="Notifications"
        >
          <FiBell size={18} />
          {notifCount > 0 ? <span style={navStyles.neonBadge}>{notifCount}</span> : null}
        </button>
        <button
          type="button"
          className="cn-navbar__icon-btn"
          style={navStyles.rightSideIcon}
          onClick={() => navigate('/company/messages')}
          aria-label="Messages"
        >
          <FiMessageSquare size={18} />
        </button>
        <button
          type="button"
          className="cn-navbar__profile"
          style={navStyles.profileBox}
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
        >
          <div style={navStyles.avatarWrapper}>
            <img
              src={logoSrc}
              alt=""
              style={navStyles.avatarImg}
              onError={() => setLogoSrc(resolvePortalImageurl('', company?.name))}
            />
            <span style={navStyles.onlineStatus} aria-hidden />
          </div>
          <span style={navStyles.profileName}>{company?.name || 'Company'} ▾</span>
          {menuOpen ? (
            <CompanyNavMenu company={company} user={user} onClose={() => setMenuOpen(false)} />
          ) : null}
        </button>
      </div>
    </nav>
  );
}
