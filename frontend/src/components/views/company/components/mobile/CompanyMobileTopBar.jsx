import React, { useEffect, useState } from 'react';
import { FiChevronDown, FiMessageSquare, FiSearch } from 'react-icons/fi';
import { useLocation, useNavigate } from 'react-router-dom';
import CompanyHubSwitch from '../../../../../modules/Dashboard/Navbar/CompanyHubSwitch';
import SwitchToAdminButton from '../../../../../modules/Dashboard/Navbar/SwitchToAdminButton';
import { shouldShowSwitchToAdmin } from '../../../../../modules/Dashboard/Navbar/useAdminHubAccess';
import { readStoredUserStub } from '../../../../../utils/storedUser';
import { useCompanyMobileChrome } from '../../context/CompanyMobileChromeContext';
import { useCompanyWorkspace } from '../../context/CompanyWorkspaceContext';
import { resolvePortalImageurl } from '../../utils/portalImage';
import '../../../../../modules/Dashboard/Navbar/hub-switch.css';
import '../../../../../modules/Dashboard/components/mobile/member-hub-company-switch.css';
import '../../../../../modules/Admin/layout/styles/admin-mobile-header.css';

const ADMIN_COMPANIES_PATH = '/admin-control/companies';

/**
 * Company mobile header — admin-style toolbar.
 * `embedded` = rendered inside global `.et-top-nav` (preferred).
 */
export default function CompanyMobileTopBar({
  isVisible = true,
  isSidebarOpen: isSidebarOpenProp,
  onSidebarToggle,
  embedded = false,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = readStoredUserStub();
  const showAdminSwitch = shouldShowSwitchToAdmin(location.pathname, user);
  const workspace = useCompanyWorkspace();
  const chrome = useCompanyMobileChrome();
  const company = workspace?.data?.company;
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [logoSrc, setLogoSrc] = useState(() =>
    resolvePortalImageurl(company?.imageurl, company?.name),
  );

  const isSidebarOpen = isSidebarOpenProp ?? chrome?.isSidebarOpen ?? false;
  const toggleSidebar = onSidebarToggle || chrome?.toggleSidebar;

  useEffect(() => {
    setLogoSrc(resolvePortalImageurl(company?.imageurl, company?.name));
  }, [company?.imageurl, company?.name]);

  const shellClass = [
    'cp-mobile-chrome',
    'cp-mobile-chrome--top',
    embedded ? 'cp-mobile-chrome--embedded' : '',
    !embedded && !isVisible ? 'cp-mobile-chrome--hidden' : '',
    searchOpen ? 'cp-mobile-chrome--search' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={shellClass}>
      <header className="cp-mobile-topbar" aria-label="Company mobile header">
        <div className="cp-mobile-topbar__row">
          <div className="cp-mobile-topbar__left">
            <button
              type="button"
              className="cp-mobile-topbar__brand"
              onClick={() => navigate('/company/dashboard')}
              aria-label="Company dashboard home"
            >
              <span className="cp-mobile-topbar__mark">ET</span>
            </button>
            <button
              type="button"
              className={`cp-mobile-topbar__sidebar-toggle${isSidebarOpen ? ' is-open' : ''}`}
              onClick={() => toggleSidebar?.()}
              aria-label={isSidebarOpen ? 'Close company menu' : 'Open company menu'}
              aria-expanded={isSidebarOpen}
            >
              <FiChevronDown size={18} aria-hidden />
            </button>
          </div>
          <div className="cp-mobile-topbar__actions">
            <button
              type="button"
              className="cp-mobile-topbar__icon-btn agn-navbar__search-toggle"
              onClick={() => setSearchOpen((open) => !open)}
              aria-label={searchOpen ? 'Close search' : 'Open search'}
              aria-expanded={searchOpen}
            >
              <FiSearch size={18} aria-hidden />
            </button>
            <button
              type="button"
              className="cp-mobile-topbar__icon-btn cp-mobile-topbar__icon-btn--chat"
              onClick={() => navigate('/company/messages')}
              aria-label="Open messages"
            >
              <FiMessageSquare size={20} aria-hidden />
              <span className="cp-mobile-topbar__chat-dot" aria-hidden />
            </button>
            {showAdminSwitch ? (
              <SwitchToAdminButton
                to={ADMIN_COMPANIES_PATH}
                className="et-hub-switch--compact cp-mobile-topbar__admin-switch"
              />
            ) : null}
            <CompanyHubSwitch user={user} compact className="cp-mobile-topbar__hub-switch" />
            <button
              type="button"
              className="cp-mobile-topbar__avatar-btn"
              onClick={() => navigate('/company/dashboard/settings')}
              aria-label="Company settings"
            >
              <img src={logoSrc} alt="" onError={() => setLogoSrc(resolvePortalImageurl('', company?.name))} />
            </button>
          </div>
        </div>
        {searchOpen ? (
          <div className="cp-mobile-topbar__search-panel">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search jobs, applicants, workspace…"
              aria-label="Search company workspace"
            />
          </div>
        ) : null}
      </header>
    </div>
  );
}
